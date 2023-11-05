import db from '../../models';

import { type Request, type Response } from 'express';
import { type HydratedDocument } from 'mongoose';
import { type IPageType } from './model';

import {
  gemDuplicate,
  gemInvalidField,
  gemNotFound,
  gemServerError,
} from '../../utils/globalErrorMessage';

const { PageType } = db;

const findPageTypes = async (): Promise<Array<HydratedDocument<IPageType>>> =>
  await new Promise((resolve, reject) => {
    PageType.find()
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('PageTypes'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findPageTypeById = async (id: string): Promise<HydratedDocument<IPageType>> =>
  await new Promise((resolve, reject) => {
    PageType.findById(id)
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('PageType'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { name } = req.body;
  if (name === undefined) {
    res.status(400).send(gemInvalidField('PageType'));
    return;
  }
  findPageTypes()
    .then((pageTypes) => {
      if (pageTypes.find((pageType) => pageType.name === name) === undefined) {
        const pageType = new PageType({
          name,
        });

        pageType
          .save()
          .then(() => {
            res.send({ message: 'PageType was registered successfully!' });
          })
          .catch((err: Error) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(400).send(gemDuplicate('Name'));
      }
    })
    .catch((err) => res.status(500).send(gemServerError(err)));
};

const update = (req: Request, res: Response): void => {
  const { id, name = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('PageType ID'));
    return;
  }
  findPageTypes()
    .then((pageTypes) => {
      const actualPageType = pageTypes.find((pageType) => String(pageType._id) === id);
      if (actualPageType !== undefined) {
        if (name !== null && name !== actualPageType.name) {
          actualPageType.name = name;
        }
        actualPageType
          .save()
          .then(() => {
            res.send({ message: 'PageType was updated successfully!', actualPageType });
          })
          .catch((err) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('PageType'));
      }
    })
    .catch((err) => res.status(500).send(gemServerError(err)));
};

const deletePageType = (req: Request, res: Response): void => {
  const { id } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('PageType ID'));
    return;
  }
  PageType.findByIdAndDelete(id)
    .then(() => {
      res.send({ message: 'PageType was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const findSingle = (req: Request, res: Response): void => {
  const { pageTypeId } = req.query;
  if (pageTypeId === undefined || typeof pageTypeId !== 'string') {
    res.status(400).send(gemInvalidField('PageType ID'));
    return;
  }
  findPageTypeById(pageTypeId)
    .then((pageType) => res.send(pageType))
    .catch((err) => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findPageTypes()
    .then((pageTypes) => res.send(pageTypes))
    .catch((err) => res.status(500).send(gemServerError(err)));
};

export { create, update, deletePageType, findSingle, findAll };
