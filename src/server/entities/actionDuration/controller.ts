import type { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';

import db from '../../models';
import {
  gemDuplicate,
  gemInvalidField,
  gemNotFound,
  gemServerError,
} from '../../utils/globalErrorMessage';

import type { IActionDuration } from './model';

const { ActionDuration } = db;

const findActionDurations = async (): Promise<Array<HydratedDocument<IActionDuration>>> =>
  await new Promise((resolve, reject) => {
    ActionDuration.find()
      .then((res) => {
        if (res.length === 0) {
          reject(gemNotFound('ActionDurations'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findActionDurationById = async (id: string): Promise<HydratedDocument<IActionDuration>> =>
  await new Promise((resolve, reject) => {
    ActionDuration.findById(id)
      .then((res) => {
        if (res === null) {
          reject(gemNotFound('ActionDuration'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const create = (req: Request, res: Response): void => {
  const { name } = req.body;
  if (name === undefined) {
    res.status(400).send(gemInvalidField('ActionDuration'));

    return;
  }
  findActionDurations()
    .then((actionDurations) => {
      if (actionDurations.find((actionDuration) => actionDuration.name === name) === undefined) {
        const toSaveActionDuration = new ActionDuration({ name });

        toSaveActionDuration
          .save()
          .then(() => {
            res.send({ message: 'ActionDuration was registered successfully!' });
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
  const { id, name = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('ActionDuration ID'));

    return;
  }
  findActionDurations()
    .then((actionDurations) => {
      const actualActionDuration = actionDurations.find(
        (actionDuration) => String(actionDuration._id) === id
      );
      if (actualActionDuration !== undefined) {
        if (name !== null && name !== actualActionDuration.name) {
          actualActionDuration.name = name;
        }
        actualActionDuration
          .save()
          .then(() => {
            res.send({
              message: 'ActionDuration was updated successfully!',
              actualActionDuration,
            });
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('ActionDuration'));
      }
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const deleteActionDuration = (req: Request, res: Response): void => {
  const { id }: { id?: string } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('ActionDuration ID'));

    return;
  }
  ActionDuration.findByIdAndDelete(id)
    .then(() => {
      res.send({ message: 'ActionDuration was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const findSingle = (req: Request, res: Response): void => {
  const { actionDurationId } = req.query;
  if (actionDurationId === undefined || typeof actionDurationId !== 'string') {
    res.status(400).send(gemInvalidField('ActionDuration ID'));

    return;
  }
  findActionDurationById(actionDurationId)
    .then((actionDuration) => res.send(actionDuration))
    .catch((err) => res.status(404).send(err));
};

const findAllPromise = async (): Promise<IActionDuration[]> =>
  await new Promise((resolve, reject) => {
    findActionDurations()
      .then((actionDurations) => {
        resolve(actionDurations);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const findAll = (req: Request, res: Response): void => {
  findAllPromise()
    .then((actionDurations) => res.send(actionDurations))
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export { create, deleteActionDuration, findAll, findAllPromise, findSingle, update };
