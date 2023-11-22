
import { type Request, type Response } from 'express';
import { type HydratedDocument } from 'mongoose';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { findRuleBookById } from '../ruleBook/controller';
import { type HydratedIRuleBook } from '../ruleBook/model';

import { type HydratedNotion, type INotion } from './model';

const { Notion } = db;

const findNotions = async (): Promise<HydratedNotion[]> =>
  await new Promise((resolve, reject) => {
    Notion.find()
      .populate<{ ruleBook: HydratedIRuleBook }>({
        path: 'ruleBook',
        select: '_id title type',
        populate: 'type',
      })
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Notions'));
        } else {
          resolve(res as HydratedNotion[]);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findNotionById = async (id: string): Promise<HydratedDocument<INotion>> =>
  await new Promise((resolve, reject) => {
    Notion.findById(id)
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Notion'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { title, text, ruleBook, i18n = null } = req.body;
  if (title === undefined || text === undefined || ruleBook === undefined) {
    res.status(400).send(gemInvalidField('Notion'));
    return;
  }
  const notion = new Notion({
    title,
    text,
    ruleBook,
  });

  if (i18n !== null) {
    notion.i18n = JSON.stringify(i18n);
  }

  notion
    .save()
    .then(() => {
      res.send(notion);
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const { id, title = null, text = null, ruleBook = null, i18n = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Notion ID'));
    return;
  }
  findNotionById(id)
    .then((notion) => {
      if (title !== null) {
        notion.title = title;
      }
      if (text !== null) {
        notion.text = text;
      }
      if (ruleBook !== null) {
        notion.ruleBook = ruleBook;
      }
      if (i18n !== null) {
        const newIntl = { ...(notion.i18n !== undefined ? JSON.parse(notion.i18n) : {}) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        notion.i18n = JSON.stringify(newIntl);
      }
      notion
        .save()
        .then(() => {
          res.send({ message: 'Notion was updated successfully!', notion });
        })
        .catch((err) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Notion'));
    });
};

const deleteNotion = (req: Request, res: Response): void => {
  const { id } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Notion ID'));
    return;
  }
  Notion.findByIdAndDelete(id)
    .then(() => {
      res.send({ message: 'Notion was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const deleteNotionsByRuleBookId = async (ruleBookId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (ruleBookId === undefined) {
      reject(gemInvalidField('Rulebook ID'));
      return;
    }
    Notion.deleteMany({ ruleBook: ruleBookId })
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(err);
      });
  });

// interface CuratedINotion {
//   i18n: Record<string, any> | Record<string, unknown>;
//   notion: HydratedNotion;
// }

const curateNotion = (notion: HydratedNotion | HydratedDocument<INotion>): Record<string, any> => {
  if (notion.i18n === undefined) {
    return notion;
  }
  return {
    ...notion,
    i18n: JSON.parse(notion.i18n),
  };
};

const findSingle = (req: Request, res: Response): void => {
  const { notionId } = req.query;
  if (notionId === undefined || typeof notionId !== 'string') {
    res.status(400).send(gemInvalidField('Notion ID'));
    return;
  }
  findNotionById(notionId)
    .then((notion) => {
      const sentObj = {
        notion,
        i18n: curateNotion(notion),
      };
      res.send(sentObj);
    })
    .catch((err) => res.status(404).send(err));
};

const findAllByRuleBook = (req: Request, res: Response): void => {
  const { ruleBookId } = req.query;
  const aggregatedNotions: Array<HydratedNotion | INotion> = [];

  findNotions()
    .then((notions) => {
      notions.forEach((notion) => {
        if (notion.ruleBook.type?.name === 'core') {
          aggregatedNotions.push(notion);
        }
      });
      if (ruleBookId !== undefined) {
        findRuleBookById(ruleBookId as string)
          .then((ruleBook) => {
            if (ruleBook.type.name !== 'core' && ruleBook.notions.length > 0) {
              aggregatedNotions.concat(ruleBook.notions);
            }
            res.send(aggregatedNotions);
          })
          .catch(() => {
            res.status(404).send(gemNotFound('RuleBook'));
          });
      } else {
        res.send(aggregatedNotions);
      }
    })
    .catch((err) => res.status(500).send(gemServerError(err)));
};

export { create, update, deleteNotion, deleteNotionsByRuleBookId, findSingle, findAllByRuleBook };
