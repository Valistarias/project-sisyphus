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

import type { IItemType } from './model';

const { ItemType } = db;

const findItemTypes = async (): Promise<Array<HydratedDocument<IItemType>>> =>
  await new Promise((resolve, reject) => {
    ItemType.find()
      .then((res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('ItemTypes'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const findItemTypeById = async (id: string): Promise<HydratedDocument<IItemType>> =>
  await new Promise((resolve, reject) => {
    ItemType.findById(id)
      .then((res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('ItemType'));
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
    res.status(400).send(gemInvalidField('ItemType'));

    return;
  }
  findItemTypes()
    .then((items) => {
      if (items.find(item => item.name === name) === undefined) {
        const itemType = new ItemType({ name });

        itemType
          .save()
          .then(() => {
            res.send(itemType);
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
    res.status(400).send(gemInvalidField('ItemType ID'));

    return;
  }
  findItemTypes()
    .then((items) => {
      const actualItemType = items.find(item => String(item._id) === id);
      if (actualItemType !== undefined) {
        if (name !== null && name !== actualItemType.name) {
          actualItemType.name = name;
        }
        actualItemType
          .save()
          .then(() => {
            res.send({
              message: 'ItemType was updated successfully!', actualItemType
            });
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('ItemType'));
      }
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const deleteItemType = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('ItemType ID'));

    return;
  }
  ItemType.findByIdAndDelete(id)
    .then(() => {
      res.send({ message: 'ItemType was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const findSingle = (req: Request, res: Response): void => {
  const { itemTypeId } = req.query;
  if (itemTypeId === undefined || typeof itemTypeId !== 'string') {
    res.status(400).send(gemInvalidField('ItemType ID'));

    return;
  }
  findItemTypeById(itemTypeId)
    .then(item => res.send(item))
    .catch(err => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findItemTypes()
    .then(items => res.send(items))
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create, deleteItemType, findAll, findSingle, update
};
