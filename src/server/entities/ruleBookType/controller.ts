import type { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';

import db from '../../models';
import {
  gemDuplicate,
  gemInvalidField,
  gemNotFound,
  gemServerError,
} from '../../utils/globalErrorMessage';

import type { HydratedIRuleBookType, IRuleBookType } from './model';

const { RuleBookType } = db;

const findRuleBookTypes = async (): Promise<HydratedIRuleBookType[]> =>
  await new Promise((resolve, reject) => {
    RuleBookType.find()
      .then((res: HydratedIRuleBookType[]) => {
        if (res.length === 0) {
          reject(gemNotFound('RuleBookTypes'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findRuleBookTypeById = async (id: string): Promise<HydratedDocument<IRuleBookType>> =>
  await new Promise((resolve, reject) => {
    RuleBookType.findById(id)
      .then((res) => {
        if (res === null) {
          reject(gemNotFound('RuleBookType'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
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
        const ruleBookType = new RuleBookType({ name });

        ruleBookType
          .save()
          .then(() => {
            res.send({ message: 'RuleBookType was registered successfully!' });
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(400).send(gemDuplicate('Name'));
      }
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
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
            res.send({
              message: 'RuleBookType was updated successfully!',
              actualRuleBookType,
            });
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('RuleBookType'));
      }
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const deleteRuleBookType = (req: Request, res: Response): void => {
  const { id }: { id?: string } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('RuleBookType ID'));

    return;
  }
  RuleBookType.findByIdAndDelete(id)
    .then(() => {
      res.send({ message: 'RuleBookType was deleted successfully!' });
    })
    .catch((err: unknown) => {
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
    .catch((err: unknown) => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findRuleBookTypes()
    .then((ruleBooks) => res.send(ruleBooks))
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export { create, deleteRuleBookType, findAll, findSingle, update };
