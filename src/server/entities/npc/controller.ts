import type { Request, Response } from 'express';
import type { ObjectId } from 'mongoose';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { smartUpdateAttacks } from '../ennemyAttack/controller';

import type { IEnnemyAttack } from '../index';
import type { BasicHydratedINPC, HydratedINPC } from './model';

import { curateI18n } from '../../utils';

const { NPC } = db;

const findNPCs = async (): Promise<HydratedINPC[]> =>
  await new Promise((resolve, reject) => {
    NPC.find()
      .populate<{ attacks: IEnnemyAttack[] }>('attacks')
      .then(async (res?: HydratedINPC[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('NPCs'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err: unknown) => {
        reject(err);
      });
  });

const basicListNPCs = async (): Promise<BasicHydratedINPC[]> =>
  await new Promise((resolve, reject) => {
    NPC.find()
      .then(async (res?: BasicHydratedINPC[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('NPCs'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err: unknown) => {
        reject(err);
      });
  });

const findNPCById = async (id: string): Promise<HydratedINPC> =>
  await new Promise((resolve, reject) => {
    NPC.findById(id)
      .populate<{ attacks: IEnnemyAttack[] }>('attacks')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('NPC'));
        } else {
          resolve(res as HydratedINPC);
        }
      })
      .catch(async (err: unknown) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const {
    ar,
    attacks,
    flightSpeed,
    hp,
    i18n = null,
    pr,
    speed,
    summary,
    swimSpeed,
    title,
    virtual
  } = req.body;
  if (
    title === undefined
    || summary === undefined
    || speed === undefined
    || hp === undefined
    || ar === undefined
  ) {
    res.status(400).send(gemInvalidField('NPC'));

    return;
  }

  const nPC = new NPC({
    ar,
    flightSpeed,
    hp,
    pr,
    speed,
    summary,
    swimSpeed,
    title,
    virtual
  });

  if (i18n !== null) {
    nPC.i18n = JSON.stringify(i18n);
  }

  smartUpdateAttacks({
    attacksToRemove: [],
    attacksToUpdate: attacks
  })
    .then((attackIds) => {
      if (attackIds.length > 0) {
        nPC.attacks = attackIds.map(attackId => String(attackId));
      }
      nPC
        .save()
        .then(() => {
          res.send(nPC);
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id,
    ar = null,
    attacks = null,
    flightSpeed = null,
    hp = null,
    i18n,
    pr = null,
    speed = null,
    summary = null,
    swimSpeed = null,
    title = null,
    virtual = null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('NPC ID'));

    return;
  }

  findNPCById(id as string)
    .then((nPC) => {
      if (title !== null) {
        nPC.title = title;
      }
      if (speed !== null) {
        nPC.speed = speed;
      }
      if (summary !== null) {
        nPC.summary = summary;
      }
      if (flightSpeed !== null) {
        nPC.flightSpeed = flightSpeed;
      }
      if (virtual !== null) {
        nPC.virtual = virtual;
      }
      if (swimSpeed !== null) {
        nPC.swimSpeed = swimSpeed;
      }
      if (hp !== null) {
        nPC.hp = hp;
      }
      if (ar !== null) {
        nPC.ar = ar;
      }
      if (pr !== null) {
        nPC.pr = pr;
      }

      interface IEnnemyAttackElt extends IEnnemyAttack {
        _id: ObjectId
      }
      const attacksToRemove = nPC.attacks.reduce((result: string[], elt: IEnnemyAttackElt) => {
        const foundAttack = attacks.find(
          attack => attack.id !== undefined && String(attack.id) === String(elt._id)
        );
        if (foundAttack === undefined) {
          result.push(String(elt._id));
        }

        return result;
      }, []);

      if (i18n !== null) {
        const newIntl = {
          ...(nPC.i18n !== null && nPC.i18n !== undefined && nPC.i18n !== ''
            ? JSON.parse(nPC.i18n)
            : {})
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        nPC.i18n = JSON.stringify(newIntl);
      }

      smartUpdateAttacks({
        attacksToRemove,
        attacksToUpdate: attacks
      })
        .then((attackIds) => {
          if (attackIds.length > 0) {
            nPC.attacks = attackIds.map(attackId => String(attackId));
          }
          nPC
            .save()
            .then(() => {
              res.send({ message: 'NPC was updated successfully!', nPC });
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('NPC'));
    });
};

const deleteNPCById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('NPC ID'));

      return;
    }
    NPC.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteNPC = (req: Request, res: Response): void => {
  const { id } = req.body;

  findNPCById(id as string)
    .then(() => {
      deleteNPCById(id as string)
        .then(() => {
          res.send({ message: 'NPC was deleted successfully!' });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('NPC'));
    });
};

interface CuratedINPC {
  i18n: Record<string, unknown>
  nPC: any
}

const findSingle = (req: Request, res: Response): void => {
  const { nPCId } = req.query;
  if (nPCId === undefined || typeof nPCId !== 'string') {
    res.status(400).send(gemInvalidField('NPC ID'));

    return;
  }
  findNPCById(nPCId)
    .then((nPCSent) => {
      const curatedActions
        = nPCSent.attacks.length > 0
          ? nPCSent.attacks.map((action) => {
              const data = action.toJSON();

              return {
                ...data,
                ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {})
              };
            })
          : [];
      const nPC = nPCSent.toJSON();
      nPC.attacks = curatedActions;
      res.send({
        nPC,
        i18n: curateI18n(nPCSent.i18n)
      });
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findNPCs()
    .then((nPCs) => {
      const curatedNPCs: CuratedINPC[] = [];

      nPCs.forEach((nPCSent) => {
        const curatedActions
          = nPCSent.attacks.length > 0
            ? nPCSent.attacks.map((action) => {
                const data = action.toJSON();

                return {
                  ...data,
                  ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {})
                };
              })
            : [];
        const nPC = nPCSent.toJSON();
        nPC.attacks = curatedActions;
        curatedNPCs.push({
          nPC,
          i18n: curateI18n(nPCSent.i18n)
        });
      });

      res.send(curatedNPCs);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAllBasic = (req: Request, res: Response): void => {
  basicListNPCs()
    .then((nPCs) => {
      const curatedNPCs: CuratedINPC[] = [];

      nPCs.forEach((nPCSent) => {
        const nPC = nPCSent.toJSON();
        curatedNPCs.push({
          nPC,
          i18n: curateI18n(nPCSent.i18n)
        });
      });

      res.send(curatedNPCs);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export { create, deleteNPC, findAll, findAllBasic, findNPCById, findSingle, update };
