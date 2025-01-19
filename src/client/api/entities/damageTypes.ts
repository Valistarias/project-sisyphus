import axios from 'axios';

import Entity from './entity';

import type { ICuratedDamageType, IDamageType } from '../../types';

interface IDamageTypePayload {
  damageTypeId: string
}

export default class DamageTypes
  extends Entity<IDamageType, ICuratedDamageType> {
  get: (payload: IDamageTypePayload) => Promise<ICuratedDamageType>;

  constructor() {
    super('damagetypes');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedDamageType);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
