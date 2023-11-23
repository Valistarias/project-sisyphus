import { type Request, type Response } from 'express';

import { getUserFromToken, type IVerifyTokenRequest } from '../../middlewares/authJwt';
import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import { type HydratedICampaign } from './model';

import type { IUser } from '../user/model';

const { Campaign } = db;

const findCampaigns = async (req: IVerifyTokenRequest): Promise<HydratedICampaign[]> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));
          return;
        }
        Campaign.find()
          .or([{ owner: user._id }, { players: user._id }])
          .populate<{ type: IUser }>('owner')
          .populate<{ ruleBook: IUser[] }>('players')
          .then(async (res: HydratedICampaign[]) => {
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

const findCampaignById = async (id: string, req: IVerifyTokenRequest): Promise<HydratedICampaign> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));
          return;
        }
        Campaign.findById(id)
          .or([{ owner: user._id }, { players: user._id }])
          .populate<{ type: IUser }>('owner')
          .populate<{ ruleBook: IUser[] }>('players')
          .then(async (res: HydratedICampaign) => {
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
      });

      campaign
        .save()
        .then(() => {
          res.send({ message: 'Campaign was created successfully!' });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err) => res.status(500).send(gemServerError(err)));
};

const update = (req: Request, res: Response): void => {
  const { id, name = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Campaign ID'));
    return;
  }
  findCampaigns()
    .then((campaigns) => {
      const actualCampaign = campaigns.find((campaign) => String(campaign._id) === id);
      if (actualCampaign !== undefined) {
        if (name !== null && name !== actualCampaign.name) {
          actualCampaign.name = name;
        }
        actualCampaign
          .save()
          .then(() => {
            res.send({ message: 'Campaign was updated successfully!', actualCampaign });
          })
          .catch((err) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('Campaign'));
      }
    })
    .catch((err) => res.status(500).send(gemServerError(err)));
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
  findCampaignById(campaignId)
    .then((campaign) => res.send(campaign))
    .catch((err) => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findCampaigns()
    .then((campaigns) => res.send(campaigns))
    .catch((err) => res.status(500).send(gemServerError(err)));
};

export { create, deleteCampaign, findAll, findSingle, update };
