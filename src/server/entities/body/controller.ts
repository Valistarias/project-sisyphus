import { type Request, type Response } from 'express';
import { type HydratedDocument } from 'mongoose';

import { getUserFromToken, type IVerifyTokenRequest } from '../../middlewares/authJwt';
import db from '../../models';
import {
  gemInvalidField,
  gemNotFound,
  gemServerError,
  gemUnauthorizedGlobal,
} from '../../utils/globalErrorMessage';
import { type ICharacter } from '../character';
import { findCharacterById } from '../character/controller';

import { deleteAmmosByBody } from './ammo/controller';
import { deleteArmorsByBody, replaceArmorByBody } from './armor/controller';
import { deleteBagsByBody, replaceBagByBody } from './bag/controller';
import { deleteImplantsByBody, replaceImplantByBody } from './implant/controller';
import { deleteItemsByBody, replaceItemByBody } from './item/controller';
import { deleteProgramsByBody, replaceProgramByBody } from './program/controller';
import { createStatsByBody, deleteStatsByBody, replaceStatByBody } from './stat/controller';
import { deleteWeaponsByBody, replaceWeaponByBody } from './weapon/controller';

import {
  type HydratedIBody,
  type HydratedIBodyAmmo,
  type HydratedIBodyArmor,
  type HydratedIBodyBag,
  type HydratedIBodyImplant,
  type HydratedIBodyItem,
  type HydratedIBodyProgram,
  type HydratedIBodyStat,
  type HydratedIBodyWeapon,
} from './index';

const { Body } = db;

const findBodiesByCharacter = async (req: Request): Promise<HydratedIBody[]> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));
          return;
        }
        Body.find({ character: req.body.characterId })
          .populate<{ character: HydratedDocument<ICharacter> }>('character')
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
          .then(async (res) => {
            if (res === undefined || res === null) {
              reject(gemNotFound('Bodies'));
            } else {
              resolve(res as HydratedIBody[]);
            }
          })
          .catch(async (err) => {
            reject(err);
          });
      })
      .catch((err: Error) => {
        reject(err);
      });
  });

const findBodyById = async (
  id: string,
  req: Request
): Promise<{ body: HydratedIBody; canEdit: boolean }> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));
          return;
        }
        Body.findById(id)
          .populate<{ character: HydratedDocument<ICharacter> }>('character')
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
          .then(async (res) => {
            if (res === undefined || res === null) {
              reject(gemNotFound('Body'));
            } else {
              resolve({
                body: res as HydratedIBody,
                canEdit:
                  String(res.character.player) === String(user._id) ||
                  (res.character.player === undefined &&
                    String(res.character.createdBy) === String(user._id)),
              });
            }
          })
          .catch(async (err) => {
            reject(err);
          });
      })
      .catch((err: Error) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { characterId, hp, stats } = req.body;
  getUserFromToken(req as IVerifyTokenRequest)
    .then((user) => {
      if (user === null) {
        res.status(404).send(gemNotFound('User'));
        return;
      }
      findCharacterById(characterId as string, req)
        .then(({ char, canEdit }) => {
          if (char !== undefined && canEdit) {
            const body = new Body({
              character: characterId,
              hp,
            });

            body
              .save()
              .then(() => {
                createStatsByBody({ bodyId: body._id.toString(), stats })
                  .then(() => {
                    res.send({ message: 'Body was created successfully!', bodyId: body._id });
                  })
                  .catch((err: Error) => {
                    res.status(500).send(gemServerError(err));
                  });
              })
              .catch((err: Error) => {
                res.status(500).send(gemServerError(err));
              });
          } else {
            res.status(401).send(gemUnauthorizedGlobal());
          }
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

const update = (req: Request, res: Response): void => {
  const { id, hp = null, alive = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Body ID'));
    return;
  }
  findBodyById(id as string, req)
    .then(({ body, canEdit }) => {
      if (body !== undefined && canEdit) {
        if (hp !== null && hp !== body.hp) {
          body.hp = hp;
        }
        if (alive !== null && alive !== body.alive) {
          body.alive = alive;
        }
        body
          .save()
          .then(() => {
            res.send({ message: 'Body was updated successfully!', body });
          })
          .catch((err: Error) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('Body'));
      }
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

const updateStats = (req: Request, res: Response): void => {
  const { id, stats } = req.body;
  if (id === undefined || stats === undefined) {
    res.status(400).send(gemInvalidField('Body ID'));
    return;
  }
  findBodyById(id as string, req)
    .then(({ body, canEdit }) => {
      if (body !== undefined && canEdit) {
        replaceStatByBody({ bodyId: id, stats })
          .then(() => {
            res.send({ message: 'Body was updated successfully!', body });
          })
          .catch((err: Error) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('Body'));
      }
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
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
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Body ID'));
    return;
  }
  findBodyById(id as string, req)
    .then(({ body, canEdit }) => {
      if (body !== undefined && canEdit) {
        deleteAmmosByBody(id as string)
          .then(() => {
            replaceArmorByBody({ bodyId: id, armorIds: armors })
              .then(() => {
                replaceBagByBody({ bodyId: id, bagIds: bags })
                  .then(() => {
                    replaceImplantByBody({ bodyId: id, implantIds: implants })
                      .then(() => {
                        replaceItemByBody({
                          bodyId: id,
                          items: items.map((itemId: string) => ({ id: itemId, qty: 1 })),
                        })
                          .then(() => {
                            replaceProgramByBody({ bodyId: id, programIds: programs })
                              .then(() => {
                                replaceWeaponByBody({ bodyId: id, weaponIds: weapons })
                                  .then(() => {
                                    res.send({ message: 'Body was updated successfully!', body });
                                  })
                                  .catch((err: Error) => {
                                    res.status(500).send(gemServerError(err));
                                  });
                              })
                              .catch((err: Error) => {
                                res.status(500).send(gemServerError(err));
                              });
                          })
                          .catch((err: Error) => {
                            res.status(500).send(gemServerError(err));
                          });
                      })
                      .catch((err: Error) => {
                        res.status(500).send(gemServerError(err));
                      });
                  })
                  .catch((err: Error) => {
                    res.status(500).send(gemServerError(err));
                  });
              })
              .catch((err: Error) => {
                res.status(500).send(gemServerError(err));
              });
          })
          .catch((err: Error) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('Body'));
      }
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

const deleteBodyById = async (id: string): Promise<boolean> =>
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
                                      .catch((err: Error) => {
                                        reject(gemServerError(err));
                                      });
                                  })
                                  .catch((err: Error) => {
                                    reject(gemServerError(err));
                                  });
                              })
                              .catch((err: Error) => {
                                reject(gemServerError(err));
                              });
                          })
                          .catch((err: Error) => {
                            reject(gemServerError(err));
                          });
                      })
                      .catch((err: Error) => {
                        reject(gemServerError(err));
                      });
                  })
                  .catch((err: Error) => {
                    reject(gemServerError(err));
                  });
              })
              .catch((err: Error) => {
                reject(gemServerError(err));
              });
          })
          .catch((err: Error) => {
            reject(gemServerError(err));
          });
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteBody = (req: Request, res: Response): void => {
  const { id } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Body ID'));
    return;
  }
  deleteBodyById(id as string)
    .then(() => {
      res.send({ message: 'Body was deleted successfully!' });
    })
    .catch((err: Error) => {
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
    .catch((err: Error) => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findBodiesByCharacter(req)
    .then((bodies) => res.send(bodies))
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
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
