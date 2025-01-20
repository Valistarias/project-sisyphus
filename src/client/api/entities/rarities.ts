import axios from 'axios';

import Entity from './entity';

import type { ICuratedRarity, IRarity } from '../../types';

interface IRarityPayload {
  rarityId: string
}

interface IChangeRaritiesOrder {
  order: Array<{
    id: string
    position: number
  }>
}

export default class Rarities
  extends Entity<IRarityPayload, IRarity, ICuratedRarity> {
  changeRaritiesOrder: (payload: IChangeRaritiesOrder) =>
  Promise<ICuratedRarity>;

  constructor() {
    super('rarities');

    this.changeRaritiesOrder = async payload =>
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
