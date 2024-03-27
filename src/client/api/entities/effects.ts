import axios from 'axios';

import { type ICuratedEffect } from '../../types';

import Entity from './entity';

interface IEffectPayload {
  effectId: string;
}

export default class Effects extends Entity {
  get: (payload: IEffectPayload) => Promise<ICuratedEffect>;

  constructor() {
    super('effects');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedEffect);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
