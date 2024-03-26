import { type Request, type Response } from 'express';

import { isAdmin } from '../../middlewares';
import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import { type HydratedIAction } from './model';

import type { IActionType, IPage, IRuleBook } from '../index';

const { Action } = db;

const findActions = async (): Promise<HydratedIAction[]> =>
  await new Promise((resolve, reject) => {
    Action.find()
      .populate<{ type: IActionType }>('type')
      .populate<{ ruleBook: IRuleBook }>('ruleBook')
      .populate<{ pages: IPage[] }>({
        path: 'pages',
        select: '_id title action position',
        options: {
          sort: { position: 'asc' },
        },
      })
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Actions'));
        } else {
          resolve(res as HydratedIAction[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findActionById = async (id: string): Promise<HydratedIAction> =>
  await new Promise((resolve, reject) => {
    Action.findById(id)
      .populate<{ type: IActionType }>('type')
      .populate<{ ruleBook: IRuleBook }>('ruleBook')
      .populate<{ pages: IPage[] }>({
        path: 'pages',
        select: '_id title action position content i18n',
        options: {
          sort: { position: 'asc' },
        },
      })
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Action'));
        } else {
          resolve(res as HydratedIAction);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, type, i18n = null, time, skill, offsetSkill, damages } = req.body;
  if (title === undefined || summary === undefined || type === undefined) {
    res.status(400).send(gemInvalidField('Action'));
    return;
  }

  const action = new Action({
    title,
    summary,
    type,
    time,
    skill,
    offsetSkill,
    damages,
  });

  if (i18n !== null) {
    action.i18n = JSON.stringify(i18n);
  }

  action
    .save()
    .then(() => {
      res.send(action);
    })
    .catch((err: Error) => {
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
    time = null,
    skill = null,
    offsetSkill = null,
    damages = null,
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Action ID'));
    return;
  }
  findActionById(id as string)
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

      if (i18n !== null) {
        const newIntl = {
          ...(action.i18n !== null && action.i18n !== undefined && action.i18n !== ''
            ? JSON.parse(action.i18n)
            : {}),
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        action.i18n = JSON.stringify(newIntl);
      }

      action
        .save()
        .then(() => {
          res.send({ message: 'Action was updated successfully!', action });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Action'));
    });
};

const deleteActionById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Action ID'));
      return;
    }
    Action.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteAction = (req: Request, res: Response): void => {
  const { id } = req.body;
  deleteActionById(id as string)
    .then(() => {
      res.send({ message: 'Action was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIAction {
  i18n: Record<string, any> | Record<string, unknown>;
  action: HydratedIAction;
}

const curateAction = (action: HydratedIAction): Record<string, any> => {
  if (action.i18n === null || action.i18n === '' || action.i18n === undefined) {
    return {};
  }
  return JSON.parse(action.i18n);
};

const findSingle = (req: Request, res: Response): void => {
  const { actionId } = req.query;
  if (actionId === undefined || typeof actionId !== 'string') {
    res.status(400).send(gemInvalidField('Action ID'));
    return;
  }
  isAdmin(req)
    .then((isUserAdmin) => {
      findActionById(actionId)
        .then((action) => {
          if ((action.ruleBook.archived || action.ruleBook.draft) && !isUserAdmin) {
            res.status(404).send();
          } else {
            const sentObj = {
              action,
              i18n: curateAction(action),
            };
            res.send(sentObj);
          }
        })
        .catch((err: Error) => {
          res.status(404).send(err);
        });
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

const findAll = (req: Request, res: Response): void => {
  findActions()
    .then((actions) => {
      const curatedActions: CuratedIAction[] = [];

      actions.forEach((action) => {
        curatedActions.push({
          action,
          i18n: curateAction(action),
        });
      });

      res.send(curatedActions);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteAction, findActionById, findAll, findSingle, update };
