import type { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';

import { getUserFromToken, type IVerifyTokenRequest } from '../../middlewares/authJwt';
import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { createOrFindCharacter } from '../character/controller';

import { deleteAmmosByBody } from './ammo/controller';
import { deleteArmorsByBody, replaceArmorByBody } from './armor/controller';
import { deleteBagsByBody, replaceBagByBody } from './bag/controller';
import { deleteImplantsByBody, replaceImplantByBody } from './implant/controller';
import { deleteItemsByBody, replaceItemByBody } from './item/controller';
import { deleteProgramsByBody, replaceProgramByBody } from './program/controller';
import { createStatsByBody, deleteStatsByBody, replaceStatByBody } from './stat/controller';
import { deleteWeaponsByBody, replaceWeaponByBody } from './weapon/controller';

import type { ICharacter } from '../character';
import type {
  HydratedIBody,
  HydratedIBodyAmmo,
  HydratedIBodyArmor,
  HydratedIBodyBag,
  HydratedIBodyImplant,
  HydratedIBodyItem,
  HydratedIBodyProgram,
  HydratedIBodyStat,
  HydratedIBodyWeapon,
} from './index';
import type { ICyberFrame } from '../cyberFrame/model';

const { Body } = db;

const findBodiesByCharacter = async (req: Request): Promise<HydratedIBody[]> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));

          return;
        }
        const { characterId }: { characterId: string } = req.body;

        Body.find({ character: characterId })
          .populate<{ character: HydratedDocument<ICharacter<string>> }>('character')
          .populate<{ cyberframe: HydratedDocument<ICyberFrame> }>('cyberframe')
          .populate<{ stats: HydratedIBodyStat[] }>({
            path: 'stats',
            select: '_id body stat value',
          })
          .populate<{ ammos: HydratedIBodyAmmo[] }>({
            path: 'ammos',
            select: '_id body ammo bag qty',
          })
          .populate<{ armors: HydratedIBodyArmor[] }>({
            path: 'armors',
            select: '_id body armor bag equiped',
          })
          .populate<{ bags: HydratedIBodyBag[] }>({
            path: 'bags',
            select: '_id body bag equiped',
          })
          .populate<{ implants: HydratedIBodyImplant[] }>({
            path: 'implants',
            select: '_id body implant bag equiped',
          })
          .populate<{ items: HydratedIBodyItem[] }>({
            path: 'items',
            select: '_id body item bag qty',
          })
          .populate<{ programs: HydratedIBodyProgram[] }>({
            path: 'programs',
            select: '_id body program bag uses',
          })
          .populate<{ weapons: HydratedIBodyWeapon[] }>({
            path: 'weapons',
            select: '_id body weapon bag ammo bullets',
          })
          .then((res: HydratedIBody[]) => {
            if (res.length === 0) {
              reject(gemNotFound('Bodies'));
            } else {
              resolve(res);
            }
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findBodyById = async (
  id: string,
  req: Request
): Promise<{
  body: HydratedIBody;
  canEdit: boolean;
}> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));

          return;
        }
        Body.findById(id)
          .populate<{ character: HydratedDocument<ICharacter<string>> }>('character')
          .populate<{ cyberframe: HydratedDocument<ICyberFrame> }>('cyberframe')
          .populate<{ stats: HydratedIBodyStat[] }>({
            path: 'stats',
            select: '_id body stat value',
          })
          .populate<{ ammos: HydratedIBodyAmmo[] }>({
            path: 'ammos',
            select: '_id body ammo bag qty',
          })
          .populate<{ armors: HydratedIBodyArmor[] }>({
            path: 'armors',
            select: '_id body armor bag equiped',
          })
          .populate<{ bags: HydratedIBodyBag[] }>({
            path: 'bags',
            select: '_id body bag equiped',
          })
          .populate<{ implants: HydratedIBodyImplant[] }>({
            path: 'implants',
            select: '_id body implant bag equiped',
          })
          .populate<{ items: HydratedIBodyItem[] }>({
            path: 'items',
            select: '_id body item bag qty',
          })
          .populate<{ programs: HydratedIBodyProgram[] }>({
            path: 'programs',
            select: '_id body program bag uses',
          })
          .populate<{ weapons: HydratedIBodyWeapon[] }>({
            path: 'weapons',
            select: '_id body weapon bag ammo bullets',
          })
          .then((res?: HydratedIBody | null) => {
            if (res === null || res === undefined) {
              reject(gemNotFound('Body'));
            } else {
              resolve({
                body: res,
                canEdit:
                  String(res.character.player) === String(user._id) ||
                  (res.character.player === undefined &&
                    String(res.character.createdBy) === String(user._id)),
              });
            }
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const {
    cyberFrameId,
    hp,
    stats,
  }: {
    cyberFrameId?: string;
    hp?: number;
    stats: Array<{
      id: string;
      value: number;
    }>;
  } = req.body;
  createOrFindCharacter(req)
    .then((characterIdSent) => {
      const body = new Body({
        character: characterIdSent,
        cyberframe: cyberFrameId,
        hp,
      });

      body
        .save()
        .then(() => {
          createStatsByBody({
            bodyId: body._id.toString(),
            stats,
          })
            .then(() => {
              res.send(characterIdSent);
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
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
  const { id, hp = null, alive = null, cyberframeId = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Body ID'));

    return;
  }
  findBodyById(id as string, req)
    .then(({ body, canEdit }) => {
      if (canEdit) {
        if (hp !== null && hp !== body.hp) {
          body.hp = hp;
        }
        if (alive !== null && alive !== body.alive) {
          body.alive = alive;
        }
        if (cyberframeId !== null && cyberframeId !== String(body.cyberframe)) {
          body.cyberframe = cyberframeId;
        }
        body
          .save()
          .then(() => {
            res.send({
              message: 'Body was updated successfully!',
              body,
            });
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('Body'));
      }
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const updateStats = (req: Request, res: Response): void => {
  const { id, stats } = req.body;
  if (id === undefined || stats === undefined) {
    res.status(400).send(gemInvalidField('Body ID'));

    return;
  }
  findBodyById(id as string, req)
    .then(({ body, canEdit }) => {
      if (canEdit) {
        replaceStatByBody({
          bodyId: id,
          stats,
        })
          .then(() => {
            res.send({
              message: 'Body was updated successfully!',
              body,
            });
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('Body'));
      }
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const resetItems = (req: Request, res: Response): void => {
  const {
    id,
    weapons = [],
    armors = [],
    bags = [],
    items = [],
    programs = [],
    implants = [],
  }: {
    id?: string;
    weapons: string[];
    armors: string[];
    bags: string[];
    items: string[];
    programs: string[];
    implants: string[];
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Body ID'));

    return;
  }
  findBodyById(id, req)
    .then(({ body, canEdit }) => {
      if (canEdit) {
        deleteAmmosByBody(id)
          .then(() => {
            replaceArmorByBody({
              bodyId: id,
              armorIds: armors,
            })
              .then(() => {
                replaceBagByBody({
                  bodyId: id,
                  bagIds: bags,
                })
                  .then(() => {
                    replaceImplantByBody({
                      bodyId: id,
                      implantIds: implants,
                    })
                      .then(() => {
                        replaceItemByBody({
                          bodyId: id,
                          items: items.map((itemId: string) => ({
                            id: itemId,
                            qty: 1,
                          })),
                        })
                          .then(() => {
                            replaceProgramByBody({
                              bodyId: id,
                              programIds: programs,
                            })
                              .then(() => {
                                replaceWeaponByBody({
                                  bodyId: id,
                                  weaponIds: weapons,
                                })
                                  .then(() => {
                                    res.send({
                                      message: 'Body was updated successfully!',
                                      body,
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
                          .catch((err: unknown) => {
                            res.status(500).send(gemServerError(err));
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
              .catch((err: unknown) => {
                res.status(500).send(gemServerError(err));
              });
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('Body'));
      }
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const deleteBodyById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Body ID'));

      return;
    }
    deleteAmmosByBody(id)
      .then(() => {
        deleteArmorsByBody(id)
          .then(() => {
            deleteBagsByBody(id)
              .then(() => {
                deleteImplantsByBody(id)
                  .then(() => {
                    deleteItemsByBody(id)
                      .then(() => {
                        deleteProgramsByBody(id)
                          .then(() => {
                            deleteWeaponsByBody(id)
                              .then(() => {
                                deleteStatsByBody(id)
                                  .then(() => {
                                    Body.findByIdAndDelete(id)
                                      .then(() => {
                                        resolve(true);
                                      })
                                      .catch((err: unknown) => {
                                        reject(gemServerError(err));
                                      });
                                  })
                                  .catch((err: unknown) => {
                                    reject(gemServerError(err));
                                  });
                              })
                              .catch((err: unknown) => {
                                reject(gemServerError(err));
                              });
                          })
                          .catch((err: unknown) => {
                            reject(gemServerError(err));
                          });
                      })
                      .catch((err: unknown) => {
                        reject(gemServerError(err));
                      });
                  })
                  .catch((err: unknown) => {
                    reject(gemServerError(err));
                  });
              })
              .catch((err: unknown) => {
                reject(gemServerError(err));
              });
          })
          .catch((err: unknown) => {
            reject(gemServerError(err));
          });
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteBody = (req: Request, res: Response): void => {
  const { id }: { id?: string } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Body ID'));

    return;
  }
  deleteBodyById(id)
    .then(() => {
      res.send({ message: 'Body was deleted successfully!' });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const deleteBodiesAndItemsByBodyId = (bodies: string[], cb: (res: Error | null) => void): void => {
  deleteBodyById(bodies[0])
    .then(() => {
      if (bodies.length > 1) {
        bodies.shift();
        deleteBodiesAndItemsByBodyId([...bodies], cb);
      } else {
        cb(null);
      }
    })
    .catch(() => {
      cb(new Error('Rulebook not found'));
    });
};

const deleteBodiesRecursive = async (bodies: string[]): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (bodies.length === 0) {
      resolve(true);

      return;
    }
    deleteBodiesAndItemsByBodyId(bodies, (err) => {
      if (err !== null) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });

const findSingle = (req: Request, res: Response): void => {
  const { bodyId } = req.query;
  if (bodyId === undefined || typeof bodyId !== 'string') {
    res.status(400).send(gemInvalidField('Body ID'));

    return;
  }
  findBodyById(bodyId, req)
    .then(({ body }) => res.send(body))
    .catch((err: unknown) => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findBodiesByCharacter(req)
    .then((bodies) => res.send(bodies))
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  deleteBodiesRecursive,
  deleteBody,
  findAll,
  findSingle,
  resetItems,
  update,
  updateStats,
};
