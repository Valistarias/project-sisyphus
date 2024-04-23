import axios from 'axios';

import { type ICuratedAmmo } from '../../types';

import Entity from './entity';

interface IAmmoPayload {
  ammoId: string;
}

export default class Ammos extends Entity {
  get: (payload: IAmmoPayload) => Promise<ICuratedAmmo>;

  constructor() {
    super('ammos');

    this.get = async (payload) =>
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
