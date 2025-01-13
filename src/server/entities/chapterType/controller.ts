import type { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';

import db from '../../models';
import {
  gemDuplicate,
  gemInvalidField,
  gemNotFound,
  gemServerError
} from '../../utils/globalErrorMessage';

import type { IChapterType } from './model';

const { ChapterType } = db;

const findChapterTypes = async (): Promise<Array<HydratedDocument<IChapterType>>> =>
  await new Promise((resolve, reject) => {
    ChapterType.find()
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('ChapterTypes'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findChapterTypeById = async (id: string): Promise<HydratedDocument<IChapterType>> =>
  await new Promise((resolve, reject) => {
    ChapterType.findById(id)
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('ChapterType'));
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
    res.status(400).send(gemInvalidField('ChapterType'));

    return;
  }
  findChapterTypes()
    .then((chapterTypes) => {
      if (chapterTypes.find(chapterType => chapterType.name === name) === undefined) {
        const chapterTypeType = new ChapterType({
          name
        });

        chapterTypeType
          .save()
          .then(() => {
            res.send({ message: 'ChapterType was registered successfully!' });
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
    res.status(400).send(gemInvalidField('ChapterType ID'));

    return;
  }
  findChapterTypes()
    .then((chapterTypes) => {
      const actualChapterType = chapterTypes.find(chapterType => String(chapterType._id) === id);
      if (actualChapterType !== undefined) {
        if (name !== null && name !== actualChapterType.name) {
          actualChapterType.name = name;
        }
        actualChapterType
          .save()
          .then(() => {
            res.send({ message: 'ChapterType was updated successfully!', actualChapterType });
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('ChapterType'));
      }
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const deleteChapterType = (req: Request, res: Response): void => {
  const { id } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('ChapterType ID'));

    return;
  }
  ChapterType.findByIdAndDelete(id)
    .then(() => {
      res.send({ message: 'ChapterType was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const findSingle = (req: Request, res: Response): void => {
  const { chapterTypeId } = req.query;
  if (chapterTypeId === undefined || typeof chapterTypeId !== 'string') {
    res.status(400).send(gemInvalidField('ChapterType ID'));

    return;
  }
  findChapterTypeById(chapterTypeId)
    .then(chapterType => res.send(chapterType))
    .catch(err => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findChapterTypes()
    .then(chapterTypes => res.send(chapterTypes))
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export { create, deleteChapterType, findAll, findSingle, update };
