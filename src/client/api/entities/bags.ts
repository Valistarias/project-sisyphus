import axios from 'axios';

import { type ICuratedBag } from '../../types';

import Entity from './entity';

interface IBagPayload {
  bagId: string;
}

export default class Bags extends Entity {
  get: (payload: IBagPayload) => Promise<ICuratedBag>;

  constructor() {
    super('bags');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedBag);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
