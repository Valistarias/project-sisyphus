import type {
  Request, Response
} from 'express';
import type { ObjectId } from 'mongoose';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';

import type {
  INode, IStat
} from '../index';
import type {
  HydratedIStatBonus
} from './model';

const {
  StatBonus, Node
} = db;

const findStatBonuses = async (): Promise<HydratedIStatBonus[]> =>
  await new Promise((resolve, reject) => {
    StatBonus.find()
      .populate<{ stat: IStat }>('stat')
      .then((res: HydratedIStatBonus[]) => {
        if (res.length === 0) {
          reject(gemNotFound('StatBonuses'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const findStatBonusById = async (id: string): Promise<HydratedIStatBonus> =>
  await new Promise((resolve, reject) => {
    StatBonus.findById(id)
      .populate<{ stat: IStat }>('stat')
      .then((res?: HydratedIStatBonus | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('StatBonus'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });

const createReadStatBonus = (
  elts: Array<{
    stat: string
    value: number
  }>,
  ids: string[],
  cb: (err: unknown, res?: string[]) => void
): void => {
  if (elts.length === 0) {
    cb(null, ids);

    return;
  }
  const actualElt = elts[0];
  StatBonus.findOne(actualElt)
    .then((sentStatBonus) => {
      if (sentStatBonus === null) {
        // Need to create it
        const statBonus = new StatBonus(actualElt);

        statBonus
          .save()
          .then(() => {
            ids.push(String(statBonus._id));
            elts.shift();
            createReadStatBonus([...elts], ids, cb);
          })
          .catch(() => {
            cb(new Error('Error reading or creating stat bonus'));
          });
      } else {
        // Exists already
        ids.push(String(sentStatBonus._id));
        if (elts.length > 1) {
          elts.shift();
          createReadStatBonus([...elts], ids, cb);
        } else {
          cb(null, ids);
        }
      }
    })
    .catch(() => {
      cb(new Error('Error reading or creating stat bonus'));
    });
};

const smartDeleteStatBonus = (
  elts: string[],
  cb: (err: unknown) => void): void => {
  if (elts.length === 0) {
    cb(null);

    return;
  }
  const actualElt = elts[0];
  let counter = 0;
  Node.find({ statBonuses: actualElt })
    .then((sentNodes: INode[]) => {
      counter += sentNodes.length;
      if (counter <= 1) {
        StatBonus.findByIdAndDelete(actualElt)
          .then(() => {
            elts.shift();
            smartDeleteStatBonus([...elts], cb);
          })
          .catch(() => {
            cb(new Error('Error deleting stat bonus'));
          });
      } else {
        elts.shift();
        smartDeleteStatBonus([...elts], cb);
      }
    })
    .catch(() => {
      cb(new Error('Error deleting stat bonus'));
    });
};

const curateStatBonusIds = async ({
  statBonusesToRemove,
  statBonusesToAdd,
  statBonusesToStay
}: {
  statBonusesToRemove: string[]
  statBonusesToAdd: Array<{
    stat: string
    value: number
  }>
  statBonusesToStay: string[]
}): Promise<string[]> =>
  await new Promise((resolve, reject) => {
    smartDeleteStatBonus(statBonusesToRemove, (err: unknown) => {
      if (err !== null) {
        reject(err);
      } else {
        createReadStatBonus(
          statBonusesToAdd,
          [],
          (err: unknown, res?: string[]) => {
            if (err !== null) {
              reject(err);
            } else {
              resolve([...statBonusesToStay, ...(res ?? [])]);
            }
          });
      }
    });
  });

const create = (req: Request, res: Response): void => {
  const {
    stat, value
  } = req.body;
  if (stat === undefined || value === undefined) {
    res.status(400).send(gemInvalidField('StatBonus'));

    return;
  }

  const statBonus = new StatBonus({
    stat,
    value
  });

  statBonus
    .save()
    .then(() => {
      res.send(statBonus);
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id, stat = null, value = null
  }: {
    id?: string
    stat: ObjectId | null
    value: number | null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('StatBonus ID'));

    return;
  }
  findStatBonusById(id)
    .then((statBonus) => {
      if (stat !== null) {
        statBonus.stat = stat;
      }
      if (value !== null) {
        statBonus.value = value;
      }

      statBonus
        .save()
        .then(() => {
          res.send({
            message: 'Stat bonus was updated successfully!', statBonus
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('StatBonus'));
    });
};

const deleteStatBonusById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('StatBonus ID'));

      return;
    }
    StatBonus.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteStatBonus = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteStatBonusById(id)
    .then(() => {
      res.send({ message: 'Stat bonus was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const findSingle = (req: Request, res: Response): void => {
  const { statBonusId } = req.query;
  if (statBonusId === undefined || typeof statBonusId !== 'string') {
    res.status(400).send(gemInvalidField('StatBonus ID'));

    return;
  }
  findStatBonusById(statBonusId)
    .then((statBonus) => {
      res.send(statBonus);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findStatBonuses()
    .then((statBonuses) => {
      res.send(statBonuses);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  curateStatBonusIds,
  deleteStatBonus,
  findAll,
  findSingle,
  findStatBonusById,
  update
};
