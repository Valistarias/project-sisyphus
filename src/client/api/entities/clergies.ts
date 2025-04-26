import axios from 'axios';

import Entity from './entity';

import type { ICuratedClergy, IClergy } from '../../types';

interface IRuleBooksVowsOrder {
  id: string;
  order: Array<{
    id: string;
    position: number;
  }>;
}

export default class Clergies extends Entity<unknown, IClergy, ICuratedClergy> {
  changeVowsOrder: (payload: IRuleBooksVowsOrder) => Promise<ICuratedClergy>;

  constructor() {
    super('clergies');

    this.changeVowsOrder = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/changevowsorder/`, payload)
          .then((res) => {
            resolve(res.data as ICuratedClergy | PromiseLike<ICuratedClergy>);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
