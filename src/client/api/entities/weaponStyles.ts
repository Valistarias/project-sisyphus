import axios from 'axios';

import Entity from './entity';

import type { ICuratedWeaponStyle } from '../../types';


interface IWeaponStylePayload {
  weaponStyleId: string;
}

export default class WeaponStyles extends Entity {
  get: (payload: IWeaponStylePayload) => Promise<ICuratedWeaponStyle>;

  constructor() {
    super('weaponstyles');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedWeaponStyle);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
