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
    ruleBook
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
    ruleBook = null
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

const findSingle = (req: Request, res: Response): void => {
  const {
    notionId
  } = req.query;
  if (notionId === undefined || typeof notionId !== 'string') {
    res.status(400).send(gemInvalidField('Notion ID'));
    return;
  }
  findNotionById(notionId)
    .then((notion) => res.send(notion))
    .catch((err) => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findNotions()
    .then((notions) => res.send(notions))
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
