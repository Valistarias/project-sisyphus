import type { Request, Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import type { ICharParam, INode } from '../index';
import type { HydratedICharParamBonus } from './model';

const { CharParamBonus, Node } = db;

const findCharParamBonuses = async (): Promise<HydratedICharParamBonus[]> =>
  await new Promise((resolve, reject) => {
    CharParamBonus.find()
      .populate<{ charParam: ICharParam }>('charParam')
      .then((res: HydratedICharParamBonus[]) => {
        if (res.length === 0) {
          reject(gemNotFound('CharParamBonuses'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findCharParamBonusById = async (id: string): Promise<HydratedICharParamBonus> =>
  await new Promise((resolve, reject) => {
    CharParamBonus.findById(id)
      .populate<{ charParam: ICharParam }>('charParam')
      .then((res: HydratedICharParamBonus | null) => {
        if (res === null) {
          reject(gemNotFound('CharParamBonus'));
        } else {
          resolve(res);
        }
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const createReadCharParamBonus = (
  elts: Array<{
    charParam: string;
    value: number;
  }>,
  ids: string[],
  cb: (err: unknown, res?: string[]) => void
): void => {
  if (elts.length === 0) {
    cb(null, ids);

    return;
  }
  const actualElt = elts[0];
  CharParamBonus.findOne(actualElt)
    .then((sentCharParamBonus) => {
      if (sentCharParamBonus === null) {
        // Need to create it
        const charParamBonus = new CharParamBonus(actualElt);

        charParamBonus
          .save()
          .then(() => {
            ids.push(String(charParamBonus._id));
            elts.shift();
            createReadCharParamBonus([...elts], ids, cb);
          })
          .catch(() => {
            cb(new Error('Error reading or creating charParam bonus'));
          });
      } else {
        // Exists already
        ids.push(String(sentCharParamBonus._id));
        if (elts.length > 1) {
          elts.shift();
          createReadCharParamBonus([...elts], ids, cb);
        } else {
          cb(null, ids);
        }
      }
    })
    .catch(() => {
      cb(new Error('Error reading or creating charParam bonus'));
    });
};

const smartDeleteCharParamBonus = (elts: string[], cb: (err: unknown) => void): void => {
  if (elts.length === 0) {
    cb(null);

    return;
  }
  const actualElt = elts[0];
  let counter = 0;
  Node.find({ charParamBonuses: actualElt })
    .then((sentNodes: INode[]) => {
      counter += sentNodes.length;
      if (counter <= 1) {
        CharParamBonus.findByIdAndDelete(actualElt)
          .then(() => {
            elts.shift();
            smartDeleteCharParamBonus([...elts], cb);
          })
          .catch(() => {
            cb(new Error('Error deleting charParam bonus'));
          });
      } else {
        elts.shift();
        smartDeleteCharParamBonus([...elts], cb);
      }
    })
    .catch(() => {
      cb(new Error('Error deleting charParam bonus'));
    });
};

const curateCharParamBonusIds = async ({
  charParamBonusesToRemove,
  charParamBonusesToAdd,
  charParamBonusesToStay,
}: {
  charParamBonusesToRemove: string[];
  charParamBonusesToAdd: Array<{
    charParam: string;
    value: number;
  }>;
  charParamBonusesToStay: string[];
}): Promise<string[]> =>
  await new Promise((resolve, reject) => {
    smartDeleteCharParamBonus(charParamBonusesToRemove, (err: unknown) => {
      if (err !== null) {
        reject(err);
      } else {
        createReadCharParamBonus(charParamBonusesToAdd, [], (err: unknown, res?: string[]) => {
          if (err !== null) {
            reject(err);
          } else {
            resolve([...charParamBonusesToStay, ...(res ?? [])]);
          }
        });
      }
    });
  });

const create = (req: Request, res: Response): void => {
  const { charParam, value } = req.body;
  if (charParam === undefined || value === undefined) {
    res.status(400).send(gemInvalidField('CharParamBonus'));

    return;
  }

  const charParamBonus = new CharParamBonus({
    charParam,
    value,
  });

  charParamBonus
    .save()
    .then(() => {
      res.send(charParamBonus);
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const { id, charParam = null, value = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('CharParamBonus ID'));

    return;
  }
  findCharParamBonusById(id as string)
    .then((charParamBonus) => {
      if (charParam !== null) {
        charParamBonus.charParam = charParam;
      }
      if (value !== null) {
        charParamBonus.value = value;
      }

      charParamBonus
        .save()
        .then(() => {
          res.send({
            message: 'CharParam bonus was updated successfully!',
            charParamBonus,
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('CharParamBonus'));
    });
};

const deleteCharParamBonusById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('CharParamBonus ID'));

      return;
    }
    CharParamBonus.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteCharParamBonus = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;
  deleteCharParamBonusById(id)
    .then(() => {
      res.send({ message: 'CharParam bonus was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const findSingle = (req: Request, res: Response): void => {
  const { charParamBonusId } = req.query;
  if (charParamBonusId === undefined || typeof charParamBonusId !== 'string') {
    res.status(400).send(gemInvalidField('CharParamBonus ID'));

    return;
  }
  findCharParamBonusById(charParamBonusId)
    .then((charParamBonus) => {
      res.send(charParamBonus);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findCharParamBonuses()
    .then((charParamBonuses) => {
      res.send(charParamBonuses);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  curateCharParamBonusIds,
  deleteCharParamBonus,
  findAll,
  findCharParamBonusById,
  findSingle,
  update,
};
