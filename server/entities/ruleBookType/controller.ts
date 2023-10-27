import db from '../../models';

import { type Request, type Response } from 'express';
import { type HydratedDocument } from 'mongoose';
import { type IRuleBookType } from './model';

import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

const { RuleBookType } = db;

const findRuleBookTypes = async (): Promise<Array<HydratedDocument<IRuleBookType>>> => await new Promise((resolve, reject) => {
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

const findRuleBookTypeById = async (id: string): Promise<HydratedDocument<IRuleBookType>> => await new Promise((resolve, reject) => {
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
  const {
    name
  } = req.body;
  if (name === undefined) {
    res.status(400).send(gemInvalidField('RuleBookType', req));
    return;
  }
  const ruleBookType = new RuleBookType({
    name
  });

  ruleBookType
    .save()
    .then(() => {
      res.send({ message: 'RuleBookType was registered successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id,
    name = null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('RuleBookType ID', req));
    return;
  }
  findRuleBookTypeById(id)
    .then((ruleBookType) => {
      if (name !== null) { ruleBookType.name = name; }
      ruleBookType.save()
        .then(() => {
          res.send({ message: 'RuleBookType was updated successfully!', ruleBookType });
        })
        .catch((err) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('RuleBookType'));
    });
};

const deleteRuleBookType = (req: Request, res: Response): void => {
  const {
    id
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('RuleBookType ID', req));
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
  const {
    ruleBookTypeId
  } = req.query;
  if (ruleBookTypeId === undefined || typeof ruleBookTypeId !== 'string') {
    res.status(400).send(gemInvalidField('RuleBookType ID', req));
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

export {
  create,
  update,
  deleteRuleBookType,
  findSingle,
  findAll
};
