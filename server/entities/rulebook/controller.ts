import db from '../../models';

import { type Request, type Response } from 'express';
import { type HydratedIRuleBook } from './model';
import { type IRuleBookType } from '../index';

import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

const { RuleBook } = db;

const findRuleBooks = async (): Promise<HydratedIRuleBook[]> => await new Promise((resolve, reject) => {
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

const findRuleBookById = async (id: string): Promise<HydratedIRuleBook> => await new Promise((resolve, reject) => {
  RuleBook.findById(id)
    .populate<{ type: IRuleBookType }>('type')
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
  const {
    title,
    summary
  } = req.body;
  if (title === undefined || summary === undefined) {
    res.status(400).send(gemInvalidField('RuleBook'));
    return;
  }
  const ruleBook = new RuleBook({
    title,
    summary
  });

  ruleBook
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
    res.status(400).send(gemInvalidField('RuleBook ID'));
    return;
  }
  findRuleBookById(id)
    .then((ruleBook) => {
      if (title !== null) { ruleBook.title = title; }
      if (summary !== null) { ruleBook.summary = summary; }
      ruleBook.save()
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

const deleteRuleBook = (req: Request, res: Response): void => {
  const {
    id
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('RuleBook ID'));
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
    res.status(400).send(gemInvalidField('RuleBook ID'));
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
