import type {
  Request, Response
} from 'express';
import type { ObjectId } from 'mongoose';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';

import type { HydratedIAction } from './model';
import type { InternationalizationType } from '../../utils/types';
import type {
  IActionDuration, IActionType, ISkill
} from '../index';

import { curateI18n } from '../../utils';

const { Action } = db;

const findActions = async (): Promise<HydratedIAction[]> =>
  await new Promise((resolve, reject) => {
    Action.find()
      .populate<{ type: IActionType }>('type')
      .populate<{ duration: IActionDuration }>('duration')
      .populate<{ skill: ISkill }>('skill')
      .then((res: HydratedIAction[]) => {
        if (res.length === 0) {
          reject(gemNotFound('Actions'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findActionById = async (id: string): Promise<HydratedIAction> =>
  await new Promise((resolve, reject) => {
    Action.findById(id)
      .populate<{ type: IActionType }>('type')
      .populate<{ duration: IActionDuration }>('duration')
      .populate<{ skill: ISkill }>('skill')
      .then((res?: HydratedIAction | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Action'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

export interface ISentAction {
  id?: string
  title: string
  summary: string
  type: ObjectId
  skill: ObjectId
  duration: ObjectId
  time?: string
  damages?: string
  offsetSkill?: string
  uses?: number
  isKarmic?: boolean
  karmicCost?: number
  i18n?: InternationalizationType
}

const updateActions = (
  elts: ISentAction[],
  ids: string[],
  cb: (err: unknown, res?: string[]) => void
): void => {
  if (elts.length === 0) {
    cb(null, ids);

    return;
  }
  const {
    id,
    title = null,
    summary = null,
    i18n = null,
    type = null,
    duration = null,
    time = null,
    skill = null,
    uses = null,
    offsetSkill = null,
    damages = null,
    isKarmic = null,
    karmicCost = null
  } = elts[0];

  if (id === undefined) {
    const action = new Action({
      title: title ?? undefined,
      summary: summary ?? undefined,
      type: type ?? undefined,
      duration: duration ?? undefined,
      time: time ?? undefined,
      skill: skill ?? undefined,
      uses: uses ?? undefined,
      offsetSkill: offsetSkill ?? undefined,
      damages: damages ?? undefined,
      isKarmic: isKarmic ?? undefined,
      karmicCost: karmicCost ?? undefined
    });

    if (i18n !== null) {
      action.i18n = JSON.stringify(i18n);
    }

    action
      .save()
      .then(() => {
        ids.push(String(action._id));
        elts.shift();
        updateActions([...elts], ids, cb);
      })
      .catch(() => {
        cb(new Error('Error reading or creating action'));
      });
  } else {
    findActionById(id)
      .then((action) => {
        if (title !== null) {
          action.title = title;
        }
        if (summary !== null) {
          action.summary = summary;
        }
        if (type !== null) {
          action.type = type;
        }
        if (time !== null) {
          action.time = time;
        }
        if (skill !== null) {
          action.skill = skill;
        }
        if (offsetSkill !== null) {
          action.offsetSkill = offsetSkill;
        }
        if (damages !== null) {
          action.damages = damages;
        }
        if (duration !== null) {
          action.duration = duration;
        }
        if (isKarmic !== null) {
          action.isKarmic = isKarmic;
        }
        if (karmicCost !== null) {
          action.karmicCost = karmicCost;
        }
        if (uses !== null) {
          action.uses = uses;
        }

        if (i18n !== null) {
          const newIntl: InternationalizationType = { ...(
            action.i18n !== undefined && action.i18n !== ''
              ? JSON.parse(action.i18n)
              : {}
          ) };

          Object.keys(i18n).forEach((lang) => {
            newIntl[lang] = i18n[lang];
          });

          action.i18n = JSON.stringify(newIntl);
        }

        action
          .save()
          .then(() => {
            ids.push(id);
            elts.shift();
            updateActions([...elts], ids, cb);
          })
          .catch(() => {
            cb(new Error('Error reading or creating action'));
          });
      })
      .catch(() => {
        cb(new Error('Error reading or creating action'));
      });
  }
};

const smartUpdateActions = async ({
  actionsToRemove,
  actionsToUpdate
}: {
  actionsToRemove: string[]
  actionsToUpdate: ISentAction[]
}): Promise<string[]> =>
  await new Promise((resolve, reject) => {
    Action.deleteMany({ _id: { $in: actionsToRemove } })
      .then(() => {
        updateActions(actionsToUpdate, [], (err: unknown, ids?: string[]) => {
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
    title,
    summary,
    type,
    duration,
    i18n = null,
    time,
    skill,
    uses,
    offsetSkill,
    damages,
    isKarmic = false,
    karmicCost
  } = req.body;
  if (
    title === undefined
    || summary === undefined
    || type === undefined
    || duration === undefined
  ) {
    res.status(400).send(gemInvalidField('Action'));

    return;
  }

  const action = new Action({
    title,
    summary,
    type,
    duration,
    time,
    skill,
    uses,
    offsetSkill,
    damages,
    isKarmic,
    karmicCost
  });

  if (i18n !== null) {
    action.i18n = JSON.stringify(i18n);
  }

  action
    .save()
    .then(() => {
      res.send(action);
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id,
    title = null,
    summary = null,
    i18n,
    type = null,
    duration = null,
    time = null,
    skill = null,
    uses = null,
    offsetSkill = null,
    damages = null,
    isKarmic = null,
    karmicCost = null
  }: {
    id?: string
    title: string | null
    summary: string | null
    i18n: InternationalizationType | null
    type: ObjectId | null
    duration: ObjectId | null
    time: string | null
    skill: ObjectId | null
    offsetSkill: string | null
    uses: number | null
    damages: string | null
    isKarmic: boolean | null
    karmicCost: number | null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Action ID'));

    return;
  }
  findActionById(id)
    .then((action) => {
      if (title !== null) {
        action.title = title;
      }
      if (summary !== null) {
        action.summary = summary;
      }
      if (type !== null) {
        action.type = type;
      }
      if (time !== null) {
        action.time = time;
      }
      if (skill !== null) {
        action.skill = skill;
      }
      if (offsetSkill !== null) {
        action.offsetSkill = offsetSkill;
      }
      if (damages !== null) {
        action.damages = damages;
      }
      if (duration !== null) {
        action.duration = duration;
      }
      if (isKarmic !== null) {
        action.isKarmic = isKarmic;
      }
      if (karmicCost !== null) {
        action.karmicCost = karmicCost;
      }
      if (uses !== null) {
        action.uses = uses;
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = { ...(
          action.i18n !== undefined && action.i18n !== ''
            ? JSON.parse(action.i18n)
            : {}
        ) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        action.i18n = JSON.stringify(newIntl);
      }

      action
        .save()
        .then(() => {
          res.send({
            message: 'Action was updated successfully!', action
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Action'));
    });
};

const deleteActionById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Action ID'));

      return;
    }
    Action.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteAction = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteActionById(id)
    .then(() => {
      res.send({ message: 'Action was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIAction {
  i18n?: InternationalizationType
  action: HydratedIAction
}

const findSingle = (req: Request, res: Response): void => {
  const { actionId } = req.query;
  if (actionId === undefined || typeof actionId !== 'string') {
    res.status(400).send(gemInvalidField('Action ID'));

    return;
  }
  findActionById(actionId)
    .then((action) => {
      const sentObj = {
        action,
        i18n: curateI18n(action.i18n)
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findActions()
    .then((actions) => {
      const curatedActions: CuratedIAction[] = [];

      actions.forEach((action) => {
        curatedActions.push({
          action,
          i18n: curateI18n(action.i18n)
        });
      });

      res.send(curatedActions);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  deleteAction,
  findActionById,
  findAll,
  findSingle,
  smartUpdateActions,
  update
};
