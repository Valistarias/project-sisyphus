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

import type { IGlobalValue } from './model';

const { GlobalValue } = db;

const findGlobalValues = async ():
Promise<Array<HydratedDocument<IGlobalValue>>> =>
  await new Promise((resolve, reject) => {
    GlobalValue.find()
      .then((res) => {
        if (res.length === 0) {
          reject(gemNotFound('GlobalValues'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findGlobalValueById = async (id: string):
Promise<HydratedDocument<IGlobalValue>> =>
  await new Promise((resolve, reject) => {
    GlobalValue.findById(id)
      .then((res) => {
        if (res === null) {
          reject(gemNotFound('GlobalValue'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const create = (req: Request, res: Response): void => {
  const {
    name, value
  } = req.body;
  if (name === undefined || value === undefined) {
    res.status(400).send(gemInvalidField('GlobalValue'));

    return;
  }
  findGlobalValues()
    .then((items) => {
      if (items.find(item => item.name === name) === undefined) {
        const globalValue = new GlobalValue({
          name,
          value
        });

        globalValue
          .save()
          .then(() => {
            res.send(globalValue);
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
    id, name = null, value = null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('GlobalValue ID'));

    return;
  }
  findGlobalValues()
    .then((items) => {
      const actualGlobalValue = items.find(item => String(item._id) === id);
      if (actualGlobalValue !== undefined) {
        if (name !== null && name !== actualGlobalValue.name) {
          actualGlobalValue.name = name;
        }
        if (value !== null) {
          actualGlobalValue.value = value;
        }
        actualGlobalValue
          .save()
          .then(() => {
            res.send({
              message: 'GlobalValue was updated successfully!', actualGlobalValue
            });
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('GlobalValue'));
      }
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const deleteGlobalValue = (req: Request, res: Response): void => {
  const { id }: { id?: string } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('GlobalValue ID'));

    return;
  }
  GlobalValue.findByIdAndDelete(id)
    .then(() => {
      res.send({ message: 'GlobalValue was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const findSingle = (req: Request, res: Response): void => {
  const { globalValueId } = req.query;
  if (globalValueId === undefined || typeof globalValueId !== 'string') {
    res.status(400).send(gemInvalidField('GlobalValue ID'));

    return;
  }
  findGlobalValueById(globalValueId)
    .then(item => res.send(item))
    .catch(err => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findGlobalValues()
    .then(items => res.send(items))
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create, deleteGlobalValue, findAll, findSingle, update
};
