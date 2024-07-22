import { type Request, type Response } from 'express';
import { type HydratedDocument, type ObjectId } from 'mongoose';

import { v4 as uuidv4 } from 'uuid';

import { getUserFromToken, type IVerifyTokenRequest } from '../../middlewares/authJwt';
import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { type ICharacter } from '../character';
import { type IUser } from '../user/model';

import { type HydratedICompleteCampaign, type HydratedISimpleCampaign } from './model';

const { Campaign } = db;

const findCampaigns = async (req: Request): Promise<HydratedICompleteCampaign[]> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));
          return;
        }
        Campaign.find()
          .or([{ owner: user._id }, { players: user._id }])
          .populate<{ owner: HydratedDocument<IUser> }>('owner')
          .populate<{ players: Array<HydratedDocument<IUser>> }>('players')
          .populate<{ characters: ICharacter[] }>({
            path: 'characters',
            select: '_id name campaign',
          })
          .then(async (res?: HydratedICompleteCampaign[] | null) => {
            if (res === undefined || res === null) {
              reject(gemNotFound('Campaigns'));
            } else {
              resolve(res);
            }
          })
          .catch(async (err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });

const findCampaignById = async (id: string, req: Request): Promise<HydratedICompleteCampaign> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));
          return;
        }
        Campaign.findById(id)
          .or([{ owner: user._id }, { players: user._id }])
          .populate<{ owner: HydratedDocument<IUser> }>('owner')
          .populate<{ players: Array<HydratedDocument<IUser>> }>('players')
          .populate<{ characters: ICharacter[] }>({
            path: 'characters',
            select: '_id name campaign',
          })
          .then(async (res?: HydratedICompleteCampaign | null) => {
            if (res === undefined || res === null) {
              reject(gemNotFound('Campaign'));
            } else {
              resolve(res);
            }
          })
          .catch(async (err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });

const findCampaignByCode = async (id: string, req: Request): Promise<HydratedISimpleCampaign> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));
          return;
        }
        Campaign.find({ code: id })
          .populate<{ owner: HydratedDocument<IUser> }>('owner')
          .then(async (res?: HydratedISimpleCampaign[] | null) => {
            if (res === undefined || res === null) {
              reject(gemNotFound('Campaign'));
            } else {
              resolve(res[0]);
            }
          })
          .catch(async (err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { name } = req.body;
  if (name === undefined) {
    res.status(400).send(gemInvalidField('Campaign'));
    return;
  }
  getUserFromToken(req as IVerifyTokenRequest)
    .then((user) => {
      if (user === null) {
        res.status(404).send(gemNotFound('User'));
        return;
      }
      const campaign = new Campaign({
        name,
        owner: user._id,
        code: uuidv4(),
      });

      campaign
        .save()
        .then(() => {
          res.send({ message: 'Campaign was created successfully!', campaignId: campaign._id });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

const update = (req: Request, res: Response): void => {
  const { id, name = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Campaign ID'));
    return;
  }
  findCampaignById(id as string, req)
    .then((campaign) => {
      if (campaign !== undefined) {
        if (name !== null && name !== campaign.name) {
          campaign.name = name;
        }
        campaign
          .save()
          .then(() => {
            res.send({ message: 'Campaign was updated successfully!', campaign });
          })
          .catch((err: Error) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('Campaign'));
      }
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

const generateCode = (req: Request, res: Response): void => {
  const { campaignId } = req.body;
  if (campaignId === undefined) {
    res.status(400).send(gemInvalidField('Campaign ID'));
    return;
  }
  getUserFromToken(req as IVerifyTokenRequest)
    .then((user) => {
      findCampaignById(campaignId as string, req)
        .then((campaign) => {
          if (
            campaign !== undefined &&
            user !== null &&
            String(campaign.owner._id) === String(user._id)
          ) {
            campaign.code = uuidv4();
            campaign
              .save()
              .then(() => {
                res.send({ message: 'Campaign code was changed successfully!', campaign });
              })
              .catch((err: Error) => {
                res.status(500).send(gemServerError(err));
              });
          } else {
            res.status(404).send(gemNotFound('Campaign'));
          }
        })
        .catch((err: Error) => res.status(500).send(gemServerError(err)));
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

const register = (req: Request, res: Response): void => {
  const { campaignCode } = req.body;
  if (campaignCode === undefined) {
    res.status(400).send(gemInvalidField('Campaign Code'));
    return;
  }

  interface ICampaignPayload extends Omit<HydratedISimpleCampaign, 'players'> {
    players: string[] | ObjectId[];
  }

  getUserFromToken(req as IVerifyTokenRequest)
    .then((user) => {
      findCampaignByCode(campaignCode as string, req)
        .then((campaign: ICampaignPayload) => {
          const foundPlayer =
            user !== null
              ? Boolean(campaign.players.find((player) => String(player) === String(user._id)))
              : false;
          if (campaign !== undefined && user !== null && !foundPlayer) {
            const newArray = campaign.players.map((player) => String(player));
            newArray.push(String(user._id));
            campaign.players = newArray;
            campaign
              .save()
              .then(() => {
                res.send({
                  message: 'Campaign was updated successfully!',
                  campaignId: campaign._id,
                });
              })
              .catch((err: Error) => {
                res.status(500).send(gemServerError(err));
              });
          } else {
            res.status(404).send(gemNotFound('Campaign'));
          }
        })
        .catch((err: Error) => res.status(500).send(gemServerError(err)));
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

const unregister = (req: Request, res: Response): void => {
  const { campaignId } = req.body;
  if (campaignId === undefined) {
    res.status(400).send(gemInvalidField('Campaign Id'));
    return;
  }

  interface ICampaignPayload extends Omit<HydratedICompleteCampaign, 'players'> {
    players: string[] | IUser[];
  }

  getUserFromToken(req as IVerifyTokenRequest)
    .then((user) => {
      findCampaignById(campaignId as string, req)
        .then((campaign: ICampaignPayload) => {
          const foundPlayer =
            user !== null
              ? Boolean(campaign.players.find((player) => String(player) === String(user._id)))
              : false;
          if (campaign !== undefined && user !== null && foundPlayer) {
            const newArray: string[] = [];
            campaign.players.forEach((player) => {
              const playerStr = String(player);
              if (playerStr !== String(user._id)) {
                newArray.push(playerStr);
              }
            });
            campaign.players = newArray;
            campaign
              .save()
              .then(() => {
                res.send({ message: 'Campaign was updated successfully!' });
              })
              .catch((err: Error) => {
                res.status(500).send(gemServerError(err));
              });
          } else {
            res.status(404).send(gemNotFound('Campaign'));
          }
        })
        .catch((err: Error) => res.status(500).send(gemServerError(err)));
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

const deleteCampaign = (req: Request, res: Response): void => {
  const { id } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Campaign ID'));
    return;
  }
  Campaign.findByIdAndDelete(id)
    .then(() => {
      res.send({ message: 'Campaign was deleted successfully!' });
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const findSingle = (req: Request, res: Response): void => {
  const { campaignId } = req.query;
  if (campaignId === undefined || typeof campaignId !== 'string') {
    res.status(400).send(gemInvalidField('Campaign ID'));
    return;
  }
  findCampaignById(campaignId, req)
    .then((campaign) => res.send(campaign))
    .catch((err) => res.status(404).send(err));
};

const findByCode = (req: Request, res: Response): void => {
  const { campaignCode } = req.query;
  if (campaignCode === undefined || typeof campaignCode !== 'string') {
    res.status(400).send(gemInvalidField('Campaign Code'));
    return;
  }
  findCampaignByCode(campaignCode, req)
    .then((campaign) => res.send(campaign))
    .catch((err) => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findCampaigns(req)
    .then((campaigns) => res.send(campaigns))
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  deleteCampaign,
  findAll,
  findByCode,
  findSingle,
  generateCode,
  register,
  unregister,
  update,
};
