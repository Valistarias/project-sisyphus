import db from '../../models';

import { type Request, type Response } from 'express';
import { type HydratedDocument } from 'mongoose';
import { type IRuleBookType } from './model';

import {
  gemDuplicate,
  gemInvalidField,
  gemNotFound,
  gemServerError,
} from '../../utils/globalErrorMessage';

const { RuleBookType } = db;

const findRuleBookTypes = async (): Promise<Array<HydratedDocument<IRuleBookType>>> =>
  await new Promise((resolve, reject) => {
    RuleBookType.find()
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('RuleBookTypes'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findRuleBookTypeById = async (id: string): Promise<HydratedDocument<IRuleBookType>> =>
  await new Promise((resolve, reject) => {
    RuleBookType.findById(id)
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('RuleBookType'));
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
    res.status(400).send(gemInvalidField('RuleBookType'));
    return;
  }
  findRuleBookTypes()
    .then((ruleBooks) => {
      if (ruleBooks.find((ruleBook) => ruleBook.name === name) === undefined) {
        const ruleBookType = new RuleBookType({
          name,
        });

        ruleBookType
          .save()
          .then(() => {
            res.send({ message: 'RuleBookType was registered successfully!' });
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
    res.status(400).send(gemInvalidField('RuleBookType ID'));
    return;
  }
  findRuleBookTypes()
    .then((ruleBooks) => {
      const actualRuleBookType = ruleBooks.find((ruleBook) => String(ruleBook._id) === id);
      if (actualRuleBookType !== undefined) {
        if (name !== null && name !== actualRuleBookType.name) {
          actualRuleBookType.name = name;
        }
        actualRuleBookType
          .save()
          .then(() => {
            res.send({ message: 'RuleBookType was updated successfully!', actualRuleBookType });
          })
          .catch((err) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('RuleBookType'));
      }
    })
    .catch((err) => res.status(500).send(gemServerError(err)));
};

const deleteRuleBookType = (req: Request, res: Response): void => {
  const { id } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('RuleBookType ID'));
    return;
  }
  RuleBookType.findByIdAndDelete(id)
    .then(() => {
      res.send({ message: 'RuleBookType was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const findSingle = (req: Request, res: Response): void => {
  const { ruleBookTypeId } = req.query;
  if (ruleBookTypeId === undefined || typeof ruleBookTypeId !== 'string') {
    res.status(400).send(gemInvalidField('RuleBookType ID'));
    return;
  }
  findRuleBookTypeById(ruleBookTypeId)
    .then((ruleBook) => res.send(ruleBook))
    .catch((err) => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findRuleBookTypes()
    .then((ruleBooks) => res.send(ruleBooks))
    .catch((err) => res.status(500).send(gemServerError(err)));
};

export { create, update, deleteRuleBookType, findSingle, findAll };
