import axios from 'axios';

import Entity from './entity';

import type { ICuratedWeapon, IWeapon } from '../../types';

interface IWeaponPayload {
  weaponId: string;
}

export default class Weapons extends Entity<IWeaponPayload, IWeapon, ICuratedWeapon> {
  getStarters: () => Promise<ICuratedWeapon[]>;

  constructor() {
    super('weapons');

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
