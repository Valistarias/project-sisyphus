import { type Request, type Response } from 'express';
import { type HydratedDocument } from 'mongoose';

import { getUserFromToken, type IVerifyTokenRequest } from '../../middlewares/authJwt';
import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { type ICampaign } from '../campaign/model';
import { type HydratedINode } from '../node/model';
import { type IUser } from '../user/model';

import { type HydratedICharacter } from './index';

const { Character } = db;

const findCharactersByPlayer = async (req: Request): Promise<HydratedICharacter[]> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));
          return;
        }
        Character.find({ player: user._id })
          .populate<{ player: IUser }>('player')
          .populate<{ createdBy: IUser }>('createdBy')
          .populate<{ campaign: ICampaign }>('campaign')
          .then(async (res) => {
            if (res === undefined || res === null) {
              reject(gemNotFound('Characters'));
            } else {
              resolve(res as HydratedICharacter[]);
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

const findCompleteCharacterById = async (
  id: string,
  req: Request
): Promise<{ char: HydratedICharacter; canEdit: boolean }> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));
          return;
        }
        Character.findById(id)
          .lean()
          .populate<{ player: HydratedDocument<IUser> }>('player')
          .populate<{ createdBy: IUser }>('createdBy')
          .populate<{ campaign: ICampaign }>('campaign')
          .populate<{ nodes: HydratedINode[] }>({
            path: 'nodes',
            select: '_id character node used',
            populate: {
              path: 'node',
              select:
                '_id title summary icon i18n rank quote cyberFrameBranch effects actions skillBonuses skillBonuses statBonuses charParamBonuses',
              populate: [
                'effects',
                'actions',
                'skillBonuses',
                'skillBonuses',
                'statBonuses',
                'charParamBonuses',
              ],
            },
          })
          .then(async (res) => {
            if (res === undefined || res === null) {
              reject(gemNotFound('Character'));
            } else {
              resolve({
                char: res as HydratedICharacter,
                canEdit: String((res as HydratedICharacter).player._id) === String(user._id),
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

const findCharacterById = async (
  id: string,
  req: Request
): Promise<{ char: HydratedICharacter; canEdit: boolean }> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));
          return;
        }
        Character.findById(id)
          .populate<{ player: HydratedDocument<IUser> }>('player')
          .populate<{ createdBy: IUser }>('createdBy')
          .populate<{ campaign: ICampaign }>('campaign')
          .populate<{ nodes: HydratedINode[] }>({
            path: 'nodes',
            select: '_id character node used',
          })
          .then(async (res) => {
            if (res === undefined || res === null) {
              reject(gemNotFound('Character'));
            } else {
              resolve({
                char: res as HydratedICharacter,
                canEdit: String((res as HydratedICharacter).player._id) === String(user._id),
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
  const { campaignId = null, player = null } = req.body;
  if (name === undefined) {
    res.status(400).send(gemInvalidField('Character'));
    return;
  }
  getUserFromToken(req as IVerifyTokenRequest)
    .then((user) => {
      if (user === null) {
        res.status(404).send(gemNotFound('User'));
        return;
      }
      const character = new Character({
        createdBy: user._id,
      });

      if (player !== null) {
        character.player = player;
      }

      if (campaignId !== null) {
        character.campaign = campaignId;
      }

      character
        .save()
        .then(() => {
          res.send({ message: 'Character was created successfully!', characterId: character._id });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

const updateInfos = (req: Request, res: Response): void => {
  const { id, name = null, campaignId = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Character ID'));
    return;
  }
  findCharacterById(id as string, req)
    .then(({ char, canEdit }) => {
      if (char !== undefined && canEdit) {
        if (name !== null && name !== char.name) {
          char.name = name;
        }
        if (
          campaignId !== null &&
          (char.campaign == null || campaignId !== String(char.campaign._id))
        ) {
          char.campaign = campaignId;
        }
        char
          .save()
          .then(() => {
            res.send({ message: 'Character was updated successfully!', char });
          })
          .catch((err: Error) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('Character'));
      }
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

const quitCampaign = (req: Request, res: Response): void => {
  const { characterId } = req.body;
  if (characterId === undefined) {
    res.status(400).send(gemInvalidField('Character ID'));
    return;
  }

  findCharacterById(characterId as string, req)
    .then(({ char, canEdit }) => {
      if (char !== undefined && canEdit) {
        char.campaign = undefined;
        char
          .save()
          .then(() => {
            res.send({ message: 'Character was unlinked of his campaign!', char });
          })
          .catch((err: Error) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('Character'));
      }
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

const deleteCharacter = (req: Request, res: Response): void => {
  const { id } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Character ID'));
    return;
  }
  Character.findByIdAndDelete(id)
    .then(() => {
      res.send({ message: 'Character was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const findSingle = (req: Request, res: Response): void => {
  const { characterId } = req.query;
  if (characterId === undefined || typeof characterId !== 'string') {
    res.status(400).send(gemInvalidField('Character ID'));
    return;
  }
  findCompleteCharacterById(characterId, req)
    .then(({ char }) => res.send(char))
    .catch((err: Error) => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findCharactersByPlayer(req)
    .then((characters) => res.send(characters))
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteCharacter, findAll, findSingle, quitCampaign, updateInfos };
