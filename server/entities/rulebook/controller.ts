import db from '../../models';

import { type Request, type Response } from 'express';
import { type HydratedDocument } from 'mongoose';
import { type IRuleBook } from './model';

import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

const { RuleBook } = db;

const findRuleBooks = async (): Promise<Array<HydratedDocument<IRuleBook>>> => await new Promise((resolve, reject) => {
  RuleBook.find()
    .then(async (res) => {
      if (res === undefined || res === null) {
        reject(gemNotFound('RuleBooks'));
      } else {
        resolve(res);
      }
    })
    .catch(async (err) => {
      reject(err);
    });
});

const findRuleBookById = async (id: string): Promise<HydratedDocument<IRuleBook>> => await new Promise((resolve, reject) => {
  RuleBook.findById(id)
    .then(async (res) => {
      if (res === undefined || res === null) {
        reject(gemNotFound('RuleBook'));
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
    summary
  } = req.body;
  if (id === undefined || title === undefined || summary === undefined) {
    res.status(400).send(gemInvalidField('RuleBook', req));
    return;
  }
  const notion = new RuleBook({
    id,
    title,
    summary
  });

  notion
    .save()
    .then(() => {
      res.send({ message: 'RuleBook was registered successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id,
    title = null,
    summary = null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('RuleBook ID', req));
    return;
  }
  findRuleBookById(id)
    .then((notion) => {
      if (title !== null) { notion.title = title; }
      if (summary !== null) { notion.summary = summary; }
      notion.save()
        .then(() => {
          res.send({ message: 'RuleBook was updated successfully!', notion });
        })
        .catch((err) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('RuleBook'));
    });
};

const deleteRuleBook = (req: Request, res: Response): void => {
  const {
    id
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('RuleBook ID', req));
    return;
  }
  RuleBook.findByIdAndDelete(id)
    .then(() => {
      res.send({ message: 'RuleBook was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const findSingle = (req: Request, res: Response): void => {
  const {
    ruleBookId
  } = req.query;
  if (ruleBookId === undefined || typeof ruleBookId !== 'string') {
    res.status(400).send(gemInvalidField('RuleBook ID', req));
    return;
  }
  findRuleBookById(ruleBookId)
    .then((ruleBook) => res.send(ruleBook))
    .catch((err) => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findRuleBooks()
    .then((ruleBooks) => res.send(ruleBooks))
    .catch((err) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  update,
  deleteRuleBook,
  findSingle,
  findAll
};
