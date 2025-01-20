import axios from 'axios';

import Entity from './entity';

import type { ICampaignEvent } from '../../types';

interface ICampaignEventsPayload {
  campaignId: string
  offset: number
}

export default class CampaignEvents
  extends Entity<unknown, ICampaignEvent, ICampaignEvent> {
  getAllByCampaign: (
    payload: ICampaignEventsPayload
  ) => Promise<ICampaignEvent[]>;

  constructor() {
    super('campaignevents');

    this.getAllByCampaign = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/bycampaign/`, { params: payload })
          .then((res: { data: ICampaignEvent[] }) => {
            resolve(res.data);
          })
          .catch((err: unknown) => {
            reject(err);
          });
      });
  }
}
