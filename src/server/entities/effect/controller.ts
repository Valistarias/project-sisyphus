import { type Request, type Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import { type HydratedIEffect } from './model';

const { Effect } = db;

const findEffects = async (): Promise<HydratedIEffect[]> =>
  await new Promise((resolve, reject) => {
    Effect.find()
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Effects'));
        } else {
          resolve(res as HydratedIEffect[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findEffectById = async (id: string): Promise<HydratedIEffect> =>
  await new Promise((resolve, reject) => {
    Effect.findById(id)
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Effect'));
        } else {
          resolve(res as HydratedIEffect);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, i18n = null, formula } = req.body;
  if (title === undefined || summary === undefined) {
    res.status(400).send(gemInvalidField('Effect'));
    return;
  }

  const effect = new Effect({
    title,
    summary,
    formula,
  });

  if (i18n !== null) {
    effect.i18n = JSON.stringify(i18n);
  }

  effect
    .save()
    .then(() => {
      res.send(effect);
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const { id, title = null, summary = null, i18n, formula = null } = req.body;
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

      if (i18n !== null) {
        const newIntl = {
          ...(effect.i18n !== null && effect.i18n !== undefined && effect.i18n !== ''
            ? JSON.parse(effect.i18n)
            : {}),
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        effect.i18n = JSON.stringify(newIntl);
      }

      effect
        .save()
        .then(() => {
          res.send({ message: 'Effect was updated successfully!', effect });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Effect'));
    });
};

const deleteEffectById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Effect ID'));
      return;
    }
    Effect.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteEffect = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteEffectById(id as string)
    .then(() => {
      res.send({ message: 'Effect was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIEffect {
  i18n: Record<string, any> | Record<string, unknown>;
  effect: HydratedIEffect;
}

const curateEffect = (effect: HydratedIEffect): Record<string, any> => {
  if (effect.i18n === null || effect.i18n === '' || effect.i18n === undefined) {
    return {};
  }
  return JSON.parse(effect.i18n);
};

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
        i18n: curateEffect(effect),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
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
          i18n: curateEffect(effect),
        });
      });

      res.send(curatedEffects);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteEffect, findAll, findEffectById, findSingle, update };
