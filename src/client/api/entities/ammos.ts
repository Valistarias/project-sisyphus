import axios from 'axios';

import Entity from './entity';

import type { IAmmo, ICuratedAmmo } from '../../types';

interface IAmmoPayload {
  ammoId: string
}

export default class Ammos extends Entity<IAmmo, ICuratedAmmo> {
  get: (payload: IAmmoPayload) => Promise<ICuratedAmmo>;

  constructor() {
    super('ammos');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedAmmo);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
