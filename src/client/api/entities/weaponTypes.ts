import axios from 'axios';

import { type ICuratedWeaponType } from '../../types';

import Entity from './entity';

interface IWeaponTypePayload {
  weaponTypeId: string;
}

export default class WeaponTypes extends Entity {
  get: (payload: IWeaponTypePayload) => Promise<ICuratedWeaponType>;

  constructor() {
    super('weapontypes');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedWeaponType);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
