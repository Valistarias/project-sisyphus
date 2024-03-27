import axios from 'axios';

import { type IRoll } from '../../types';

import Entity from './entity';

interface IRollsPayload {
  campaignId: string;
  offset: number;
}

export default class Rolls extends Entity {
  getAllByCampaign: (payload: IRollsPayload) => Promise<IRoll[]>;

  constructor() {
    super('rolls');

    this.getAllByCampaign = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/bycampaign/`, { params: payload })
          .then((res) => {
            resolve(res.data as IRoll[]);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
