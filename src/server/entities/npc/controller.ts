import type {
  Request, Response
} from 'express';
import type { FlattenMaps, HydratedDocument } from 'mongoose';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';
import { type ISentEnnemyAttack, smartUpdateAttacks } from '../ennemyAttack/controller';

import type { ICuratedEnnemyAttackToSend, InternationalizationType } from '../../utils/types';
import type { HydratedIEnnemyAttack } from '../index';
import type {
  BasicHydratedINPC, HydratedINPC,
  INPC
} from './model';

import { curateI18n } from '../../utils';

const { NPC } = db;

const findNPCs = async (): Promise<HydratedINPC[]> =>
  await new Promise((resolve, reject) => {
    NPC.find()
      .populate<{ attacks: HydratedIEnnemyAttack[] }>('attacks')
      .then((res: HydratedINPC[]) => {
        if (res.length === 0) {
          reject(gemNotFound('NPCs'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const basicListNPCs = async (): Promise<BasicHydratedINPC[]> =>
  await new Promise((resolve, reject) => {
    NPC.find()
      .then((res?: BasicHydratedINPC[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('NPCs'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findNPCById = async (id: string): Promise<HydratedINPC> =>
  await new Promise((resolve, reject) => {
    NPC.findById(id)
      .populate<{ attacks: HydratedIEnnemyAttack[] }>('attacks')
      .then((res) => {
        if (res === null) {
          reject(gemNotFound('NPC'));
        } else {
          resolve(res as HydratedINPC);
        }
      })
      .catch((err: unknown) => {
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
  }: {
    id?: string
    title: string | null
    summary: string | null
    i18n: InternationalizationType | null
    ar: number | null
    pr: number | null
    attacks: ISentEnnemyAttack[] | null
    speed: number | null
    swimSpeed: number | null
    flightSpeed: number | null
    hp: number | null
    virtual: boolean | null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('NPC ID'));

    return;
  }

  findNPCById(id)
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

      let attacksToRemove: string[] = [];

      if (attacks !== null) {
        attacksToRemove = nPC.attacks.reduce(
          (result: string[], elt: HydratedIEnnemyAttack) => {
            const foundAttack = attacks.find(
              attack => attack.id !== undefined
                && String(attack.id) === String(elt._id)
            );
            if (foundAttack === undefined) {
              result.push(String(elt._id));
            }

            return result;
          }, []);

        if (i18n !== null) {
          const newIntl: InternationalizationType = { ...(
            nPC.i18n !== undefined
            && nPC.i18n !== ''
              ? JSON.parse(nPC.i18n)
              : {}) };

          Object.keys(i18n).forEach((lang) => {
            newIntl[lang] = i18n[lang];
          });

          nPC.i18n = JSON.stringify(newIntl);
        }
      }

      smartUpdateAttacks({
        attacksToRemove,
        attacksToUpdate: attacks ?? []
      })
        .then((attackIds) => {
          if (attackIds.length > 0) {
            nPC.attacks = attackIds.map(attackId => String(attackId));
          }
          nPC
            .save()
            .then(() => {
              res.send({
                message: 'NPC was updated successfully!', nPC
              });
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

const deleteNPCById = async (id?: string): Promise<boolean> =>
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
  const { id }: { id: string } = req.body;

  findNPCById(id)
    .then(() => {
      deleteNPCById(id)
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

const findSingle = (req: Request, res: Response): void => {
  const { nPCId } = req.query;
  if (nPCId === undefined || typeof nPCId !== 'string') {
    res.status(400).send(gemInvalidField('NPC ID'));

    return;
  }
  findNPCById(nPCId)
    .then((nPCSent: HydratedDocument<
      Omit<INPC, 'attacks'> & { attacks: HydratedIEnnemyAttack[] }
    >) => {
      const curatedAttacks
        = nPCSent.attacks.length > 0
          ? nPCSent.attacks.map((attack) => {
              const data = attack.toJSON();

              return {
                ...data,
                ...(
                  data.i18n !== undefined
                    ? { i18n: JSON.parse(data.i18n) }
                    : {}
                )
              };
            })
          : [];
      res.send({
        nPC: {
          ...nPCSent.toJSON(),
          attacks: curatedAttacks
        },
        i18n: curateI18n(nPCSent.i18n)
      });
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findNPCs()
    .then((nPCs: Array<
      HydratedDocument<
        Omit<FlattenMaps<INPC>, 'attacks'>
        & {
          attacks: HydratedIEnnemyAttack[]
        }
      >
    >) => {
      const curatedNPCs: Array<{
        nPC: Omit<
          FlattenMaps<INPC>
          , 'attacks'
        > & {
          attacks: ICuratedEnnemyAttackToSend[]
        }
        i18n?: InternationalizationType
      }> = [];

      nPCs.forEach((nPCSent) => {
        const curatedAttacks
        = nPCSent.attacks.length > 0
          ? nPCSent.attacks.map((attack) => {
              const data = attack.toJSON();

              return {
                ...data,
                ...(
                  data.i18n !== undefined
                    ? { i18n: JSON.parse(data.i18n) }
                    : {}
                )
              };
            })
          : [];
        curatedNPCs.push({
          nPC: {
            ...nPCSent.toJSON(),
            attacks: curatedAttacks
          },
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
      res.send(
        nPCs.map(nPCSent => ({
          nPC: nPCSent.toJSON(),
          i18n: curateI18n(nPCSent.i18n)
        }))
      );
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create, deleteNPC, findAll, findAllBasic, findNPCById, findSingle, update
};
