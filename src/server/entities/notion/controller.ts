import type {
  Request, Response
} from 'express';
import type { HydratedDocument, ObjectId } from 'mongoose';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';
import { findRuleBookById } from '../ruleBook/controller';

import type {
  HydratedNotion, INotion
} from './model';
import type { InternationalizationType } from '../../utils/types';
import type { HydratedIRuleBook, IRuleBookType } from '../index';

import { curateI18n } from '../../utils';

const { Notion } = db;

const findNotions = async (): Promise<HydratedNotion[]> =>
  await new Promise((resolve, reject) => {
    Notion.find()
      .populate<{ ruleBook: HydratedIRuleBook }>({
        path: 'ruleBook',
        select: '_id title type',
        populate: 'type'
      })
      .then((res: HydratedNotion[]) => {
        if (res.length === 0) {
          reject(gemNotFound('Notions'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const findNotionById = async (id: string): Promise<HydratedDocument<INotion>> =>
  await new Promise((resolve, reject) => {
    Notion.findById(id)
      .then((res?: HydratedDocument<INotion> | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Notion'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const {
    title, text, ruleBook, i18n = null
  } = req.body;
  if (title === undefined || text === undefined || ruleBook === undefined) {
    res.status(400).send(gemInvalidField('Notion'));

    return;
  }
  const notion = new Notion({
    title,
    text,
    ruleBook
  });

  if (i18n !== null) {
    notion.i18n = JSON.stringify(i18n);
  }

  notion
    .save()
    .then(() => {
      res.send(notion);
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id, title = null, text = null, ruleBook = null, i18n = null
  }: {
    id?: string
    title: string | null
    text: string | null
    i18n: InternationalizationType | null
    ruleBook: ObjectId | null
  } = req.body;
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
        const newIntl: InternationalizationType = { ...(
          notion.i18n !== undefined
            ? JSON.parse(notion.i18n)
            : {}
        ) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        notion.i18n = JSON.stringify(newIntl);
      }
      notion
        .save()
        .then(() => {
          res.send({
            message: 'Notion was updated successfully!', notion
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Notion'));
    });
};

const deleteNotion = (req: Request, res: Response): void => {
  const { id }: { id?: string } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Notion ID'));

    return;
  }
  Notion.findByIdAndDelete(id)
    .then(() => {
      res.send({ message: 'Notion was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const deleteNotionsByRuleBookId = async (
  ruleBookId?: string
): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (ruleBookId === undefined) {
      reject(gemInvalidField('Rulebook ID'));

      return;
    }
    Notion.deleteMany({ ruleBook: ruleBookId })
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

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
        i18n: curateI18n(notion.i18n)
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => res.status(404).send(err));
};

const findAllByRuleBook = (req: Request, res: Response): void => {
  const { ruleBookId }: {
    ruleBookId?: string
  } = req.query;
  const aggregatedNotions: Array<HydratedNotion | INotion> = [];

  findNotions()
    .then((notions) => {
      notions.forEach((notion) => {
        if ((notion.ruleBook.type as IRuleBookType).name === 'core') {
          aggregatedNotions.push(notion);
        }
      });
      if (ruleBookId !== undefined) {
        findRuleBookById(ruleBookId)
          .then((ruleBook) => {
            if ((ruleBook.type as IRuleBookType).name !== 'core' && ruleBook.notions.length > 0) {
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
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  deleteNotion,
  deleteNotionsByRuleBookId,
  findAllByRuleBook,
  findSingle,
  update
};
