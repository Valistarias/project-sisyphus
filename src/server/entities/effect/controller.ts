import type {
  Request, Response
} from 'express';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';

import type { InternationalizationType } from '../../utils/types';
import type { IActionType } from '../index';
import type { HydratedIEffect } from './model';

import { curateI18n } from '../../utils';

const { Effect } = db;

const findEffects = async (): Promise<HydratedIEffect[]> =>
  await new Promise((resolve, reject) => {
    Effect.find()
      .populate<{ type: IActionType }>('type')
      .then((res?: HydratedIEffect[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Effects'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const findEffectById = async (id: string): Promise<HydratedIEffect> =>
  await new Promise((resolve, reject) => {
    Effect.findById(id)
      .populate<{ type: IActionType }>('type')
      .then((res?: HydratedIEffect | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Effect'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
export interface ISentEffect {
  id?: string
  title: string
  summary: string
  formula?: string
  type: string
  i18n?: {
    title: string
    summary: string
  }
}

const updateEffects = (
  elts: ISentEffect[],
  ids: string[],
  cb: (err: unknown, res?: string[]) => void
): void => {
  if (elts.length === 0) {
    cb(null, ids);

    return;
  }
  const {
    id, title, summary, type, i18n = null, formula
  } = elts[0];
  if (id === undefined) {
    const effect = new Effect({
      title,
      summary,
      formula,
      type
    });

    if (i18n !== null) {
      effect.i18n = JSON.stringify(i18n);
    }

    effect
      .save()
      .then(() => {
        ids.push(String(effect._id));
        elts.shift();
        updateEffects([...elts], ids, cb);
      })
      .catch(() => {
        cb(new Error('Error reading or creating effect'));
      });
  } else {
    findEffectById(id)
      .then((effect) => {
        if (title !== null) {
          effect.title = title;
        }
        if (summary !== null) {
          effect.summary = summary;
        }
        if (formula !== null) {
          effect.formula = formula;
        }
        if (type !== null) {
          effect.type = type;
        }

        if (i18n !== null) {
          const newIntl: InternationalizationType = { ...(effect.i18n !== null && effect.i18n !== undefined && effect.i18n !== ''
            ? JSON.parse(effect.i18n)
            : {}) };

          Object.keys(i18n).forEach((lang) => {
            newIntl[lang] = i18n[lang];
          });

          effect.i18n = JSON.stringify(newIntl);
        }

        effect
          .save()
          .then(() => {
            ids.push(id);
            elts.shift();
            updateEffects([...elts], ids, cb);
          })
          .catch(() => {
            cb(new Error('Error reading or creating effect'));
          });
      })
      .catch(() => {
        cb(new Error('Error reading or creating effect'));
      });
  }
};

const smartUpdateEffects = async ({
  effectsToRemove,
  effectsToUpdate
}: {
  effectsToRemove: string[]
  effectsToUpdate: ISentEffect[]
}): Promise<string[]> =>
  await new Promise((resolve, reject) => {
    Effect.deleteMany({ _id: { $in: effectsToRemove } })
      .then(() => {
        updateEffects(effectsToUpdate, [], (err: unknown, ids?: string[]) => {
          if (err !== null) {
            reject(err);
          } else {
            resolve(ids ?? []);
          }
        });
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const {
    title, summary, type, i18n = null, formula
  } = req.body;
  if (title === undefined || summary === undefined || type === undefined) {
    res.status(400).send(gemInvalidField('Effect'));

    return;
  }

  const effect = new Effect({
    title,
    summary,
    formula,
    type
  });

  if (i18n !== null) {
    effect.i18n = JSON.stringify(i18n);
  }

  effect
    .save()
    .then(() => {
      res.send(effect);
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id, title = null, summary = null, i18n, formula = null, type = null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Effect ID'));

    return;
  }
  findEffectById(id as string)
    .then((effect) => {
      if (title !== null) {
        effect.title = title;
      }
      if (summary !== null) {
        effect.summary = summary;
      }
      if (formula !== null) {
        effect.formula = formula;
      }
      if (type !== null) {
        effect.type = type;
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = { ...(effect.i18n !== null && effect.i18n !== undefined && effect.i18n !== ''
          ? JSON.parse(effect.i18n)
          : {}) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        effect.i18n = JSON.stringify(newIntl);
      }

      effect
        .save()
        .then(() => {
          res.send({
            message: 'Effect was updated successfully!', effect
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Effect'));
    });
};

const deleteEffectById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Effect ID'));

      return;
    }
    Effect.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteEffect = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteEffectById(id)
    .then(() => {
      res.send({ message: 'Effect was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

export interface CuratedIEffect {
  i18n?: InternationalizationType
  effect: HydratedIEffect
}

const findSingle = (req: Request, res: Response): void => {
  const { effectId } = req.query;
  if (effectId === undefined || typeof effectId !== 'string') {
    res.status(400).send(gemInvalidField('Effect ID'));

    return;
  }
  findEffectById(effectId)
    .then((effect) => {
      const sentObj = {
        effect,
        i18n: curateI18n(effect.i18n)
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findEffects()
    .then((effects) => {
      const curatedEffects: CuratedIEffect[] = [];

      effects.forEach((effect) => {
        curatedEffects.push({
          effect,
          i18n: curateI18n(effect.i18n)
        });
      });

      res.send(curatedEffects);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create, deleteEffect, findAll, findEffectById, findSingle, smartUpdateEffects, update
};
