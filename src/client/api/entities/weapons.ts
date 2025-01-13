import axios from 'axios';

import Entity from './entity';

import type { ICuratedWeapon } from '../../types';

interface IWeaponPayload {
  weaponId: string
}

export default class Weapons extends Entity {
  get: (payload: IWeaponPayload) => Promise<ICuratedWeapon>;
  getStarters: () => Promise<ICuratedWeapon[]>;

  constructor() {
    super('weapons');

    this.get = async payload =>
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

    this.getStarters = async () =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/starter/`)
          .then((res) => {
            resolve(res.data as ICuratedWeapon[]);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
