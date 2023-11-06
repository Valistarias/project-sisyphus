import db from '../../models';

import { type Request, type Response } from 'express';
import { type HydratedIRuleBook } from './model';
import type { IRuleBookType, INotion, HydratedIChapter } from '../index';

import { deleteNotionsByRuleBookId } from '../notion/controller';

import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

const { RuleBook, Chapter } = db;

const findRuleBooks = async (): Promise<HydratedIRuleBook[]> =>
  await new Promise((resolve, reject) => {
    RuleBook.find()
      .populate<{ type: IRuleBookType }>('type')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('RuleBooks'));
        } else {
          resolve(res as HydratedIRuleBook[]);
        }
      })
      .catch(async (err) => {
        reject(err);
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
        populate: 'type',
        options: {
          sort: { position: 'asc' },
        },
      })
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('RuleBook'));
        } else {
          resolve(res as HydratedIRuleBook);
        }
      })
      .catch(async (err) => {
        reject(err);
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
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const { id, title = null, type = null, summary = null, i18n } = req.body;
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

      if (i18n !== null) {
        const newIntl = {
          ...(ruleBook.i18n !== null && ruleBook.i18n !== undefined && ruleBook.i18n !== ''
            ? JSON.parse(ruleBook.i18n)
            : {}),
        };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        ruleBook.i18n = JSON.stringify(newIntl);
      }

      ruleBook
        .save()
        .then(() => {
          res.send({ message: 'RuleBook was updated successfully!', ruleBook });
        })
        .catch((err) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('RuleBook'));
    });
};

const updateMultipleChaptersPosition = (order: any, cb: (res: Error | null) => void): void => {
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

const changeChapterOrder = (req: Request, res: Response): void => {
  const { id, order } = req.body;
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
  const { id } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('RuleBook ID'));
    return;
  }
  deleteNotionsByRuleBookId(id)
    .then(() => {
      RuleBook.findByIdAndDelete(id)
        .then(() => {
          res.send({ message: 'RuleBook was deleted successfully!' });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedIRuleBook {
  i18n: Record<string, any> | Record<string, unknown>;
  ruleBook: HydratedIRuleBook;
}

const curateRuleBook = (ruleBook: HydratedIRuleBook): Record<string, any> => {
  if (ruleBook.i18n === null || ruleBook.i18n === '' || ruleBook.i18n === undefined) {
    return {};
  }
  return JSON.parse(ruleBook.i18n);
};

const findSingle = (req: Request, res: Response): void => {
  const { ruleBookId } = req.query;
  if (ruleBookId === undefined || typeof ruleBookId !== 'string') {
    res.status(400).send(gemInvalidField('RuleBook ID'));
    return;
  }
  findRuleBookById(ruleBookId)
    .then((ruleBook) => {
      const sentObj = {
        ruleBook,
        i18n: curateRuleBook(ruleBook),
      };
      res.send(sentObj);
    })
    .catch((err) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findRuleBooks()
    .then((ruleBooks) => {
      const curatedRuleBooks: CuratedIRuleBook[] = [];

      ruleBooks.forEach((ruleBook) => {
        curatedRuleBooks.push({
          ruleBook,
          i18n: curateRuleBook(ruleBook),
        });
      });

      res.send(curatedRuleBooks);
    })
    .catch((err) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  update,
  changeChapterOrder,
  deleteRuleBook,
  findSingle,
  findAll,
  findRuleBookById,
};
