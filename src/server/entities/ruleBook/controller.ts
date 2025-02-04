import type { Request, Response } from 'express';
import type { ObjectId } from 'mongoose';

import { isAdmin, type IVerifyTokenRequest } from '../../middlewares';
import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { deleteChaptersRecursive } from '../chapter/controller';
import { deleteNotionsByRuleBookId } from '../notion/controller';

import type { BasicHydratedIRuleBook, HydratedIRuleBook } from './model';
import type { InternationalizationType } from '../../utils/types';
import type { HydratedIChapter, INotion, IRuleBookType } from '../index';

import { curateI18n } from '../../utils';

const { RuleBook, Chapter } = db;

const ruleBookOrder = ['core', 'addon', 'adventure'];

const findRuleBooks = async (): Promise<BasicHydratedIRuleBook[]> =>
  await new Promise((resolve, reject) => {
    RuleBook.find()
      .populate<{ type: IRuleBookType }>('type')
      .then((res: BasicHydratedIRuleBook[]) => {
        if (res.length === 0) {
          reject(gemNotFound('RuleBooks'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findRuleBookById = async (id: string): Promise<HydratedIRuleBook> =>
  await new Promise((resolve, reject) => {
    RuleBook.findById(id)
      .populate<{ type: IRuleBookType }>('type')
      .populate<{ notions: INotion[] }>({
        path: 'notions',
        select: '_id title ruleBook',
      })
      .populate<{ chapters: HydratedIChapter[] }>({
        path: 'chapters',
        select: '_id title ruleBook position type',
        populate: [
          {
            path: 'pages',
            select: '_id title chapter position',
            options: { sort: { position: 'asc' } },
          },
          'type',
        ],
        options: { sort: { position: 'asc' } },
      })
      .then((res?: HydratedIRuleBook | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('RuleBook'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, summary, type, i18n = null } = req.body;
  if (title === undefined || summary === undefined) {
    res.status(400).send(gemInvalidField('RuleBook'));

    return;
  }
  const ruleBook = new RuleBook({
    title,
    summary,
    type,
  });

  if (i18n !== null) {
    ruleBook.i18n = JSON.stringify(i18n);
  }

  ruleBook
    .save()
    .then(() => {
      res.send(ruleBook);
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id,
    title = null,
    type = null,
    summary = null,
    draft = null,
    i18n,
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    type: ObjectId | null;
    i18n: InternationalizationType | null;
    draft: boolean | null;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('RuleBook ID'));

    return;
  }
  findRuleBookById(id)
    .then((ruleBook) => {
      if (title !== null) {
        ruleBook.title = title;
      }
      if (summary !== null) {
        ruleBook.summary = summary;
      }
      if (type !== null) {
        ruleBook.type = type;
      }
      if (draft !== null) {
        ruleBook.draft = draft;
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = {
          ...(ruleBook.i18n != null && ruleBook.i18n !== '' ? JSON.parse(ruleBook.i18n) : {}),
        };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        ruleBook.i18n = JSON.stringify(newIntl);
      }

      ruleBook
        .save()
        .then(() => {
          res.send({
            message: 'RuleBook was updated successfully!',
            ruleBook,
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('RuleBook'));
    });
};

const archive = (req: Request, res: Response): void => {
  const {
    id,
    archived = null,
  }: {
    id?: string;
    archived: boolean | null;
  } = req.body;
  if (id === undefined || archived === null) {
    res.status(400).send(gemInvalidField('RuleBook ID'));

    return;
  }
  findRuleBookById(id)
    .then((ruleBook) => {
      ruleBook.archived = archived;

      ruleBook
        .save()
        .then(() => {
          res.send({
            message: 'RuleBook was updated successfully!',
            ruleBook,
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('RuleBook'));
    });
};

const updateMultipleChaptersPosition = (
  order: Array<{
    id: string;
    position: number;
  }>,
  cb: (res: Error | null) => void
): void => {
  Chapter.findOneAndUpdate({ _id: order[0].id }, { position: order[0].position })
    .then(() => {
      if (order.length > 1) {
        order.shift();
        updateMultipleChaptersPosition([...order], cb);
      } else {
        cb(null);
      }
    })
    .catch(() => {
      cb(new Error('Rulebook not found'));
    });
};

const changeChaptersOrder = (req: Request, res: Response): void => {
  const {
    id,
    order,
  }: {
    id?: string;
    order?: Array<{
      id: string;
      position: number;
    }>;
  } = req.body;
  if (id === undefined || order === undefined) {
    res.status(400).send(gemInvalidField('RuleBook Reordering'));

    return;
  }
  updateMultipleChaptersPosition(order, (err) => {
    if (err !== null) {
      res.status(404).send(gemNotFound('RuleBook'));
    } else {
      res.send({ message: 'RuleBook was updated successfully!' });
    }
  });
};

const deleteRuleBook = (req: Request, res: Response): void => {
  const { id }: { id?: string } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('RuleBook ID'));

    return;
  }
  findRuleBookById(id)
    .then((ruleBook) => {
      deleteNotionsByRuleBookId(id)
        .then(() => {
          deleteChaptersRecursive(ruleBook.chapters.map((chapter) => String(chapter._id)))
            .then(() => {
              RuleBook.findByIdAndDelete(id)
                .then(() => {
                  res.send({ message: 'RuleBook was deleted successfully!' });
                })
                .catch((err: unknown) => {
                  res.status(500).send(gemServerError(err));
                });
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

interface CuratedIRuleBook {
  i18n?: InternationalizationType;
  ruleBook: BasicHydratedIRuleBook;
}

const findSingle = (req: IVerifyTokenRequest, res: Response): void => {
  const { ruleBookId } = req.query;
  if (ruleBookId === undefined || typeof ruleBookId !== 'string') {
    res.status(400).send(gemInvalidField('RuleBook ID'));

    return;
  }
  isAdmin(req)
    .then((isUserAdmin) => {
      findRuleBookById(ruleBookId)
        .then((ruleBook) => {
          if ((ruleBook.archived || ruleBook.draft) && !isUserAdmin) {
            res.status(404).send();
          } else {
            const sentObj = {
              ruleBook,
              i18n: curateI18n(ruleBook.i18n),
            };
            res.send(sentObj);
          }
        })
        .catch((err: unknown) => {
          res.status(404).send(err);
        });
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAll = (req: IVerifyTokenRequest, res: Response): void => {
  isAdmin(req)
    .then((isUserAdmin) => {
      findRuleBooks()
        .then((ruleBooks) => {
          const curatedRuleBooks: CuratedIRuleBook[] = [];

          if (!isUserAdmin) {
            ruleBooks = ruleBooks.filter((ruleBook) => !ruleBook.archived && !ruleBook.draft);
          }

          // Sorting by state first (draft, archived)
          // Then by type
          ruleBooks
            .sort((rb1, rb2) => {
              let ptRb1 = 0;
              let ptRb2 = 0;
              if (rb1.draft) {
                ptRb1++;
              }
              if (rb1.archived) {
                ptRb1 += 2;
              }
              if (rb2.draft) {
                ptRb2++;
              }
              if (rb2.archived) {
                ptRb2 += 2;
              }
              if (ptRb1 < ptRb2) {
                return -1;
              } else if (ptRb1 > ptRb2) {
                return 1;
              }

              if (
                ruleBookOrder.findIndex((el) => el === rb1.type.name) >
                ruleBookOrder.findIndex((el) => el === rb2.type.name)
              ) {
                return 1;
              } else if (
                ruleBookOrder.findIndex((el) => el === rb1.type.name) <
                ruleBookOrder.findIndex((el) => el === rb2.type.name)
              ) {
                return -1;
              }

              return 0;
            })
            .forEach((ruleBook) => {
              curatedRuleBooks.push({
                ruleBook,
                i18n: curateI18n(ruleBook.i18n),
              });
            });

          res.send(curatedRuleBooks);
        })
        .catch((err: unknown) => res.status(500).send(gemServerError(err)));
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  archive,
  changeChaptersOrder,
  create,
  deleteRuleBook,
  findAll,
  findRuleBookById,
  findSingle,
  update,
};
