import axios from 'axios';

import { type ICuratedWeaponStyle } from '../../types';

import Entity from './entity';

interface IWeaponStylePayload {
  itemModifierId: string;
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
