import axios from 'axios';

import { type IDamage } from '../../types';

import Entity from './entity';

interface IDamagePayload {
  damageId: string;
}

export default class Damages extends Entity {
  get: (payload: IDamagePayload) => Promise<IDamage>;

  constructor() {
    super('damages');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as IDamage);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
