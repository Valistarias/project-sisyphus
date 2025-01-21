import type {
  Request, Response
} from 'express';
import type { HydratedDocument } from 'mongoose';

import {
  getUserFromToken, type IVerifyTokenRequest
} from '../../middlewares/authJwt';
import db from '../../models';
import {
  gemInvalidField,
  gemNotFound,
  gemServerError,
  gemUnauthorizedGlobal
} from '../../utils/globalErrorMessage';
import { deleteBodiesRecursive } from '../body/controller';

import {
  createNodesByCharacter,
  deleteNodesByCharacter,
  deleteSpecificNodesByCharacter,
  replaceCyberFrameNodeByCharacter
} from './node/controller';

import type { HydratedIBackground } from '../background/model';
import type { HydratedIBody } from '../body';
import type { ICampaign } from '../campaign/model';
import type { HydratedINode } from '../node/model';
import type { IUser } from '../user/model';
import type { LeanICharacter } from './id/model';
import type { HydratedICharacter } from './index';

const { Character } = db;

const findCharactersByPlayer = async (
  req: Request
): Promise<HydratedICharacter[]> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));

          return;
        }
        Character.find()
          .or([{ player: user._id }, { createdBy: user._id }])
          .populate<{ player: HydratedDocument<IUser> }>('player')
          .populate<{ createdBy: HydratedDocument<IUser> }>('createdBy')
          .populate<{ campaign: HydratedDocument<ICampaign> }>('campaign')
          .populate<{ nodes: HydratedINode[] }>({
            path: 'nodes',
            select: '_id character node used',
            populate: {
              path: 'node',
              select:
                '_id title summary icon i18n rank quote cyberFrameBranch skillBranch effects actions skillBonuses skillBonuses statBonuses charParamBonuses'
            }
          })
          .populate<{ bodies: HydratedIBody[] }>({
            path: 'bodies',
            select: '_id character alive hp stats createdAt',
            populate: [
              {
                path: 'stats',
                select: '_id body stat value'
              },
              {
                path: 'ammos',
                select: '_id body ammo bag qty'
              },
              {
                path: 'armors',
                select: '_id body armor bag equiped'
              },
              {
                path: 'bags',
                select: '_id body bag equiped'
              },
              {
                path: 'implants',
                select: '_id body implant bag equiped'
              },
              {
                path: 'items',
                select: '_id body item bag qty'
              },
              {
                path: 'programs',
                select: '_id body program bag uses'
              },
              {
                path: 'weapons',
                select: '_id body weapon bag ammo bullets'
              }
            ]
          })
          .populate<{ background: HydratedIBackground }>('background')
          .then((res: HydratedICharacter[]) => {
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findCompleteCharacterById = async (
  id: string,
  req: Request
): Promise<{
  char: LeanICharacter
  canEdit: boolean
}> =>
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
          .populate<{ createdBy: HydratedDocument<IUser> }>('createdBy')
          .populate<{ campaign: HydratedDocument<ICampaign> }>('campaign')
          .populate<{ nodes: HydratedINode[] }>({
            path: 'nodes',
            select: '_id character node used',
            populate: {
              path: 'node',
              select:
                '_id title summary icon i18n rank quote cyberFrameBranch skillBranch effects actions skillBonuses skillBonuses statBonuses charParamBonuses',
              populate: [
                'effects',
                'actions',
                'skillBonuses',
                'statBonuses',
                'charParamBonuses'
              ]
            }
          })
          .populate<{ bodies: HydratedIBody[] }>({
            path: 'bodies',
            select: '_id character alive hp stats createdAt',
            populate: [
              {
                path: 'stats',
                select: '_id body stat value'
              },
              {
                path: 'ammos',
                select: '_id body ammo bag qty'
              },
              {
                path: 'armors',
                select: '_id body armor bag equiped'
              },
              {
                path: 'bags',
                select: '_id body bag equiped'
              },
              {
                path: 'implants',
                select: '_id body implant bag equiped'
              },
              {
                path: 'items',
                select: '_id body item bag qty'
              },
              {
                path: 'programs',
                select: '_id body program bag uses'
              },
              {
                path: 'weapons',
                select: '_id body weapon bag ammo bullets'
              }
            ]
          })
          .populate<{ background: HydratedIBackground }>({
            path: 'background',
            select: '_id title summary i18n skillBonuses statBonuses charParamBonuses createdAt',
            populate: [
              'skillBonuses',
              'statBonuses',
              'charParamBonuses'
            ]
          })
          .then((res?: LeanICharacter | null) => {
            if (res === undefined || res === null) {
              reject(gemNotFound('Character'));
            } else {
              resolve({
                char: res,
                canEdit: String(res.player?._id) === String(user._id)
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

const findCharacterById = async (
  id: string,
  req: Request
): Promise<{
  char: HydratedICharacter
  canEdit: boolean
}> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));

          return;
        }
        Character.findById(id)
          .populate<{ player: HydratedDocument<IUser> }>('player')
          .populate<{ createdBy: HydratedDocument<IUser> }>('createdBy')
          .populate<{ campaign: HydratedDocument<ICampaign> }>('campaign')
          .populate<{ nodes: HydratedINode[] }>({
            path: 'nodes',
            select: '_id character node used'
          })
          .populate<{ bodies: HydratedIBody[] }>({
            path: 'bodies',
            select: '_id character alive hp stats createdAt',
            populate: [
              {
                path: 'stats',
                select: '_id body stat value'
              },
              {
                path: 'ammos',
                select: '_id body ammo bag qty'
              },
              {
                path: 'armors',
                select: '_id body armor bag equiped'
              },
              {
                path: 'bags',
                select: '_id body bag equiped'
              },
              {
                path: 'implants',
                select: '_id body implant bag equiped'
              },
              {
                path: 'items',
                select: '_id body item bag qty'
              },
              {
                path: 'programs',
                select: '_id body program bag uses'
              },
              {
                path: 'weapons',
                select: '_id body weapon bag ammo bullets'
              }
            ]
          })
          .populate<{ background: HydratedIBackground }>('background')
          .then((res) => {
            if (res === null) {
              reject(gemNotFound('Character'));
            } else {
              const canEdit: boolean
                = String(
                  (res as HydratedICharacter).player?._id
                ) === String(user._id)
                || String(
                  (res as HydratedICharacter).createdBy._id
                ) === String(user._id);
              resolve({
                char: res as HydratedICharacter,
                canEdit
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

const addFirstCyberFrameNode = (req: Request, res: Response): void => {
  const { nodeId } = req.body;
  if (nodeId === undefined) {
    res.status(400).send(gemInvalidField('Character'));

    return;
  }
  createOrFindCharacter(req)
    .then((characterIdSent) => {
      replaceCyberFrameNodeByCharacter({
        characterId: characterIdSent,
        nodeIds: [nodeId]
      })
        .then(() => {
          findCompleteCharacterById(characterIdSent, req)
            .then(({ char }) => res.send(char))
            .catch((err: unknown) => res.status(404).send(err));
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const addNode = (req: Request, res: Response): void => {
  const { nodeId } = req.body;
  if (nodeId === undefined) {
    res.status(400).send(gemInvalidField('Character'));

    return;
  }
  createOrFindCharacter(req)
    .then((characterIdSent) => {
      createNodesByCharacter({
        characterId: characterIdSent,
        nodeIds: [nodeId]
      })
        .then(() => {
          findCompleteCharacterById(characterIdSent, req)
            .then(({ char }) => res.send(char))
            .catch((err: unknown) => res.status(404).send(err));
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const updateNodes = (req: Request, res: Response): void => {
  const {
    characterId, toAdd, toRemove
  } = req.body;
  if (characterId === undefined) {
    res.status(400).send(gemInvalidField('Character'));

    return;
  }
  createOrFindCharacter(req)
    .then((characterIdSent) => {
      deleteSpecificNodesByCharacter({
        characterId: characterIdSent,
        nodeIds: toRemove
      })
        .then(() => {
          createNodesByCharacter({
            characterId: characterIdSent,
            nodeIds: toAdd
          })
            .then(() => {
              findCompleteCharacterById(characterIdSent, req)
                .then(({ char }) => res.send(char))
                .catch((err: unknown) => res.status(404).send(err));
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

const createOrFindCharacter = async (req: Request): Promise<string> =>
  await new Promise((resolve, reject) => {
    const { characterId = null } = req.body;
    if (characterId === null) {
      getUserFromToken(req as IVerifyTokenRequest)
        .then((user) => {
          if (user === null) {
            reject(gemNotFound('User'));
          } else {
            Character.create({ createdBy: user._id })
              .then(({ _id }) => {
                resolve(_id.toString());
              })
              .catch((err: unknown) => {
                reject(err);
              });
          }
        })
        .catch((err: unknown) => {
          reject(err);
        });
    } else {
      findCharacterById(characterId as string, req)
        .then(({
          char, canEdit
        }) => {
          if (canEdit) {
            resolve(characterId as string);
          } else {
            reject(gemUnauthorizedGlobal());
          }
        })
        .catch((err: unknown) => {
          reject(err);
        });
    }
  });

const create = (req: Request, res: Response): void => {
  const {
    campaignId, player = null
  } = req.body;
  getUserFromToken(req as IVerifyTokenRequest)
    .then((user) => {
      if (user === null) {
        res.status(404).send(gemNotFound('User'));

        return;
      }
      const character = new Character({ createdBy: user._id });

      if (player !== null) {
        character.player = player;
      }

      if (campaignId !== undefined) {
        character.campaign = campaignId;
      }

      character
        .save()
        .then(() => {
          res.send({
            message: 'Character was created successfully!', characterId: character._id
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const updateInfos = (req: Request, res: Response): void => {
  const {
    id,
    firstName = null,
    lastName = null,
    nickName = null,
    money = null,
    karma = null,
    campaignId = null,
    backgroundId = null,
    gender = null,
    pronouns = null,
    bio = null,
    isReady = null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Character ID'));

    return;
  }
  findCharacterById(id as string, req)
    .then(({
      char, canEdit
    }) => {
      if (canEdit) {
        if (firstName !== null && firstName !== char.firstName) {
          char.firstName = firstName;
        }
        if (lastName !== null && lastName !== char.lastName) {
          char.lastName = lastName;
        }
        if (nickName !== null && nickName !== char.nickName) {
          char.nickName = nickName;
        }
        if (gender !== null && gender !== char.gender) {
          char.gender = gender;
        }
        if (pronouns !== null && pronouns !== char.pronouns) {
          char.pronouns = pronouns;
        }
        if (bio !== null && bio !== char.bio) {
          char.bio = bio;
        }
        if (money !== null && money !== char.money) {
          char.money = money;
        }
        if (karma !== null && karma !== char.karma) {
          char.karma = karma;
        }
        if (backgroundId !== null && backgroundId !== char.background) {
          char.background = backgroundId;
        }
        if (isReady !== null && isReady !== char.isReady) {
          char.isReady = isReady;
          if (isReady === true && char.level === undefined) {
            char.level = 1;
          }
        }
        if (campaignId !== null) {
          char.campaign = campaignId;
        }
        if (campaignId === false) {
          char.campaign = undefined;
        }
        char
          .save()
          .then(() => {
            res.send({
              message: 'Character was updated successfully!', char
            });
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('Character'));
      }
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const quitCampaign = (req: Request, res: Response): void => {
  const { characterId } = req.body;
  if (characterId === undefined) {
    res.status(400).send(gemInvalidField('Character ID'));

    return;
  }

  findCharacterById(characterId as string, req)
    .then(({
      char, canEdit
    }) => {
      if (canEdit) {
        char.campaign = undefined;
        char
          .save()
          .then(() => {
            res.send({
              message: 'Character was unlinked of his campaign!', char
            });
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('Character'));
      }
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const deleteCharacter = (req: Request, res: Response): void => {
  const { id }: { id?: string } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Character ID'));

    return;
  }
  findCharacterById(id, req)
    .then(({
      char, canEdit
    }) => {
      if (canEdit) {
        const bodyIds: string[] = [];
        char.bodies?.forEach((body) => {
          bodyIds.push(body._id.toString());
        });
        deleteBodiesRecursive(bodyIds)
          .then(() => {
            deleteNodesByCharacter(id)
              .then(() => {
                Character.findByIdAndDelete(id)
                  .then(() => {
                    res.send({ message: 'Character was deleted successfully!' });
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
        res.status(404).send(gemNotFound('Character'));
      }
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findSingle = (req: Request, res: Response): void => {
  const { characterId } = req.query;
  if (characterId === undefined || typeof characterId !== 'string') {
    res.status(400).send(gemInvalidField('Character ID'));

    return;
  }
  findCompleteCharacterById(characterId, req)
    .then(({ char }) => res.send(char))
    .catch((err: unknown) => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findCharactersByPlayer(req)
    .then(characters => res.send(characters))
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  addFirstCyberFrameNode,
  addNode,
  create,
  deleteCharacter,
  findAll,
  findCharacterById,
  findSingle,
  quitCampaign,
  updateInfos,
  updateNodes
};
