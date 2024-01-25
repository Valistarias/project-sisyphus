import { type Request, type Response } from 'express';
import { type HydratedDocument } from 'mongoose';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { type ICampaign } from '../campaign/model';
import { type ICharacter } from '../character/model';

import { type HydratedRoll, type IRoll } from './model';

const { Roll } = db;

const findRollsByCampaignId = async (id: string): Promise<HydratedRoll[]> =>
  await new Promise((resolve, reject) => {
    Roll.find({ campaign: id })
      .populate<{ character: ICharacter }>('character')
      .populate<{ campaign: ICampaign }>('campaign')
      .then(async (res: HydratedRoll[]) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Rolls'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err) => {
        reject(err);
      });
  });

const findRollById = async (id: string): Promise<HydratedDocument<IRoll>> =>
  await new Promise((resolve, reject) => {
    Roll.findById(id)
      .then(async (res: HydratedDocument<IRoll>) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Roll'));
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
    formula === undefined ||
    character === undefined ||
    type === undefined ||
    campaign === undefined
  ) {
    res.status(400).send(gemInvalidField('Roll'));
    return;
  }
  const roll = new Roll({
    result,
    type,
    formula,
    character,
    campaign,
  });

  roll
    .save()
    .then(() => {
      res.send(roll);
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
    res.status(400).send(gemInvalidField('Roll ID'));
    return;
  }
  findRollById(id as string)
    .then((roll) => {
      if (result !== null) {
        roll.result = result;
      }
      if (formula !== null) {
        roll.formula = formula;
      }
      if (character !== null) {
        roll.character = character;
      }
      if (campaign !== null) {
        roll.campaign = campaign;
      }
      if (type !== null) {
        roll.type = type;
      }
      roll
        .save()
        .then(() => {
          res.send({ message: 'Roll was updated successfully!', roll });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Roll'));
    });
};

const deleteRollByCampaignId = async (campaignId: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (campaignId === undefined) {
      reject(gemInvalidField('Campaign ID'));
      return;
    }
    Roll.deleteMany({ campaign: campaignId })
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(err);
      });
  });

const findAllByCampaign = (req: Request, res: Response): void => {
  const { campaignId } = req.query;
  findRollsByCampaignId(campaignId as string)
    .then((rolls) => {
      res.send(rolls);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteRollByCampaignId, findAllByCampaign, update };
