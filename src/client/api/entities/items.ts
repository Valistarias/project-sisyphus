import axios from 'axios';

import { type ICuratedItem } from '../../types';

import Entity from './entity';

interface IItemPayload {
  itemId: string;
}

export default class Items extends Entity {
  get: (payload: IItemPayload) => Promise<ICuratedItem>;

  constructor() {
    super('items');

    this.get = async (payload) =>
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
  }
}
