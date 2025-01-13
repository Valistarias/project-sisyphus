import axios from 'axios';

import Entity from './entity';

import type { ICuratedBag } from '../../types';

interface IBagPayload {
  bagId: string
}

export default class Bags extends Entity {
  get: (payload: IBagPayload) => Promise<ICuratedBag>;
  getStarters: () => Promise<ICuratedBag[]>;

  constructor() {
    super('bags');

    this.get = async payload =>
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
    this.getStarters = async () =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/starter/`)
          .then((res) => {
            resolve(res.data as ICuratedBag[]);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
