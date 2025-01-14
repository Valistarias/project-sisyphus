import type {
  Request, Response
} from 'express';
import type { HydratedDocument } from 'mongoose';

import db from '../../models';
import {
  gemDuplicate,
  gemInvalidField,
  gemNotFound,
  gemServerError
} from '../../utils/globalErrorMessage';

import type { IActionType } from './model';

const { ActionType } = db;

const findActionTypes = async (): Promise<Array<HydratedDocument<IActionType>>> =>
  await new Promise((resolve, reject) => {
    ActionType.find()
      .then((res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('ActionTypes'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const findActionTypeById = async (id: string): Promise<HydratedDocument<IActionType>> =>
  await new Promise((resolve, reject) => {
    ActionType.findById(id)
      .then((res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('ActionType'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { name } = req.body;
  if (name === undefined) {
    res.status(400).send(gemInvalidField('ActionType'));

    return;
  }
  findActionTypes()
    .then((actionTypes) => {
      if (actionTypes.find(actionType => actionType.name === name) === undefined) {
        const toSaveActionType = new ActionType({ name });

        toSaveActionType
          .save()
          .then(() => {
            res.send({ message: 'ActionType was registered successfully!' });
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(400).send(gemDuplicate('Name'));
      }
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const update = (req: Request, res: Response): void => {
  const {
    id, name = null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('ActionType ID'));

    return;
  }
  findActionTypes()
    .then((actionTypes) => {
      const actualActionType = actionTypes.find(actionType => String(actionType._id) === id);
      if (actualActionType !== undefined) {
        if (name !== null && name !== actualActionType.name) {
          actualActionType.name = name;
        }
        actualActionType
          .save()
          .then(() => {
            res.send({
              message: 'ActionType was updated successfully!', actualActionType
            });
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('ActionType'));
      }
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const deleteActionType = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('ActionType ID'));

    return;
  }
  ActionType.findByIdAndDelete(id)
    .then(() => {
      res.send({ message: 'ActionType was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const findSingle = (req: Request, res: Response): void => {
  const { actionTypeId } = req.query;
  if (actionTypeId === undefined || typeof actionTypeId !== 'string') {
    res.status(400).send(gemInvalidField('ActionType ID'));

    return;
  }
  findActionTypeById(actionTypeId)
    .then(actionType => res.send(actionType))
    .catch(err => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findActionTypes()
    .then(actionTypes => res.send(actionTypes))
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create, deleteActionType, findAll, findSingle, update
};
