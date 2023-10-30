import db from '../../models';

import { type Request, type Response } from 'express';
import { type HydratedDocument } from 'mongoose';
import { type INotion } from './model';

import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

const { Notion } = db;

const findNotions = async (): Promise<Array<HydratedDocument<INotion>>> => await new Promise((resolve, reject) => {
  Notion.find()
    .then(async (res) => {
      if (res === undefined || res === null) {
        reject(gemNotFound('Notions'));
      } else {
        resolve(res);
      }
    })
    .catch(async (err) => {
      reject(err);
    });
});

const findNotionById = async (id: string): Promise<HydratedDocument<INotion>> => await new Promise((resolve, reject) => {
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
  const {
    id,
    title,
    short,
    text,
    ruleBook,
    i18n = null
  } = req.body;
  if (id === undefined || title === undefined || short === undefined || text === undefined || ruleBook === undefined) {
    res.status(400).send(gemInvalidField('Notion'));
    return;
  }
  const notion = new Notion({
    id,
    title,
    short,
    text,
    ruleBook
  });

  if (i18n !== null) { ruleBook.i18n = JSON.stringify(i18n); }

  notion
    .save()
    .then(() => {
      res.send({ message: 'Notion was registered successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id,
    title = null,
    short = null,
    text = null,
    ruleBook = null,
    i18n = null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Notion ID'));
    return;
  }
  findNotionById(id)
    .then((notion) => {
      if (title !== null) { notion.title = title; }
      if (short !== null) { notion.short = short; }
      if (text !== null) { notion.text = text; }
      if (ruleBook !== null) { notion.ruleBook = ruleBook; }
      if (i18n !== null) {
        const newIntl = { ...(notion.i18n !== null ? JSON.parse(notion.i18n) : {}) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang].contentString;
        });

        notion.i18n = JSON.stringify(newIntl);
      }
      notion.save()
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
  const {
    id
  } = req.body;
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

const deleteNotionByRuleBookId = (req: Request, res: Response): void => {
  const {
    id
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Rulebook ID'));
    return;
  }
  Notion.deleteMany({ ruleBook: id })
    .then(() => {
      res.send({ message: 'Notions were deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

interface CuratedINotion {
  i18n: Record<string, any> | null
  ruleBook: INotion
}

const curateNotion = (notion: INotion): Record<string, any> => {
  if (notion.i18n === null) { return notion; }
  return {
    ...notion,
    i18n: JSON.parse(notion.i18n)
  };
};

const findSingle = (req: Request, res: Response): void => {
  const {
    notionId
  } = req.query;
  if (notionId === undefined || typeof notionId !== 'string') {
    res.status(400).send(gemInvalidField('Notion ID'));
    return;
  }
  findNotionById(notionId)
    .then((notion) => {
      const sentObj = {
        notion,
        i18n: curateNotion(notion)
      };
      res.send(sentObj);
    })
    .catch((err) => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findNotions()
    .then((notions) => {
      const curatedRuleBooks: CuratedINotion[] = [];

      notions.forEach((ruleBook) => {
        curatedRuleBooks.push({
          ruleBook,
          i18n: curateNotion(ruleBook)
        });
      });

      res.send(curatedRuleBooks);
    })
    .catch((err) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  update,
  deleteNotion,
  deleteNotionByRuleBookId,
  findSingle,
  findAll
};
