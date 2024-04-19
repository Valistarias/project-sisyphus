import axios from 'axios';

import { type ICuratedWeapon } from '../../types';

import Entity from './entity';

interface IWeaponPayload {
  weaponId: string;
}

export default class Weapons extends Entity {
  get: (payload: IWeaponPayload) => Promise<ICuratedWeapon>;

  constructor() {
    super('weapons');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedWeapon);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
