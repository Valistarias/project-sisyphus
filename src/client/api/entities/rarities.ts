import axios from 'axios';

import { type ICuratedRarity } from '../../types';

import Entity from './entity';

interface IRarityPayload {
  rarityId: string;
}

interface IChangeRaritiesOrder {
  order: Array<{
    id: string;
    position: number;
  }>;
}

export default class Rarities extends Entity {
  get: (payload: IRarityPayload) => Promise<ICuratedRarity>;
  changeRaritiesOrder: (payload: IChangeRaritiesOrder) => Promise<ICuratedRarity>;

  constructor() {
    super('rarities');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedRarity);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.changeRaritiesOrder = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/changeraritiesorder/`, payload)
          .then((res) => {
            resolve(res.data as ICuratedRarity);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
