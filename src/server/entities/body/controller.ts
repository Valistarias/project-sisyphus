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

import { createStatsByBody } from './stat/controller';

import { type HydratedIBody, type HydratedIBodyStat } from './index';

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

const deleteBody = (req: Request, res: Response): void => {
  const { id } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Body ID'));
    return;
  }
  Body.findByIdAndDelete(id)
    .then(() => {
      res.send({ message: 'Body was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

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

export { create, deleteBody, findAll, findSingle, update };
