import axios from 'axios';

import Entity from './entity';

import type { ICuratedItem } from '../../types';

interface IItemPayload {
  itemId: string
}

export default class Items extends Entity {
  get: (payload: IItemPayload) => Promise<ICuratedItem>;
  getStarters: () => Promise<ICuratedItem[]>;

  constructor() {
    super('items');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedItem);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.getStarters = async () =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/starter/`)
          .then((res) => {
            resolve(res.data as ICuratedItem[]);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
