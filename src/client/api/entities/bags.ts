import axios from 'axios';

import Entity from './entity';

import type { IBag, ICuratedBag } from '../../types';

interface IBagPayload {
  bagId: string
}

export default class Bags extends Entity<IBagPayload, IBag, ICuratedBag> {
  getStarters: () => Promise<ICuratedBag[]>;

  constructor() {
    super('bags');

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
