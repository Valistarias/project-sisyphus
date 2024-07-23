import axios from 'axios';

import { type ICampaignEvent } from '../../types';

import Entity from './entity';

interface ICampaignEventsPayload {
  campaignId: string;
  offset: number;
}

export default class CampaignEvents extends Entity {
  getAllByCampaign: (payload: ICampaignEventsPayload) => Promise<ICampaignEvent[]>;

  constructor() {
    super('campaignevents');

    this.getAllByCampaign = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/bycampaign/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICampaignEvent[]);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
