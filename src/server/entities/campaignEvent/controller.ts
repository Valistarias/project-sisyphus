import type { Request, Response } from 'express';
import type { HydratedDocument } from 'mongoose';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';

import type { ICampaign } from '../campaign/model';
import type { ICharacter } from '../character';
import type { ICampaignEvent, LeanICampaignEvent } from './model';

const { CampaignEvent } = db;
const perRequest = 10;

const findCampaignEventsByCampaignId = async (
  id: string,
  offset = 0
): Promise<LeanICampaignEvent[]> =>
  await new Promise((resolve, reject) => {
    CampaignEvent.find({ campaign: id })
      .lean()
      .sort({
        createdAt: 'desc',
      })
      .limit(perRequest)
      .skip(offset)
      .populate<{ character: HydratedDocument<ICharacter> }>('character')
      .populate<{ campaign: HydratedDocument<ICampaign> }>('campaign')
      .then(async (res?: LeanICampaignEvent[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('CampaignEvents'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findCampaignEventById = async (id: string): Promise<HydratedDocument<ICampaignEvent>> =>
  await new Promise((resolve, reject) => {
    CampaignEvent.findById(id)
      .then(async (res: HydratedDocument<ICampaignEvent>) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('CampaignEvent'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const { result, formula, character, campaign, type } = req.body;
  if (
    result === undefined ||
    character === undefined ||
    type === undefined ||
    campaign === undefined
  ) {
    res.status(400).send(gemInvalidField('CampaignEvent'));
    return;
  }
  const campaignEvent = new CampaignEvent({
    result,
    type,
    formula,
    character,
    campaign,
  });

  campaignEvent
    .save()
    .then(() => {
      res.send(campaignEvent);
    })
    .catch((err: Error) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id,
    result = null,
    formula = null,
    character = null,
    campaign = null,
    type = null,
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('CampaignEvent ID'));
    return;
  }
  findCampaignEventById(id as string)
    .then((campaignEvent) => {
      if (result !== null) {
        campaignEvent.result = result;
      }
      if (formula !== null) {
        campaignEvent.formula = formula;
      }
      if (character !== null) {
        campaignEvent.character = character;
      }
      if (campaign !== null) {
        campaignEvent.campaign = campaign;
      }
      if (type !== null) {
        campaignEvent.type = type;
      }
      campaignEvent
        .save()
        .then(() => {
          res.send({ message: 'CampaignEvent was updated successfully!', campaignEvent });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('CampaignEvent'));
    });
};

const deleteCampaignEventByCampaignId = async (campaignId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (campaignId === undefined) {
      reject(gemInvalidField('Campaign ID'));
      return;
    }
    CampaignEvent.deleteMany({ campaign: campaignId })
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(err);
      });
  });

const findAllByCampaign = (req: Request, res: Response): void => {
  const { campaignId, offset } = req.query;
  findCampaignEventsByCampaignId(campaignId as string, (offset ?? 0) as number)
    .then((campaignEvents) => {
      res.send(campaignEvents.reverse());
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteCampaignEventByCampaignId, findAllByCampaign, update };
