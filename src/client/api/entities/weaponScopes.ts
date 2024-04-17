import axios from 'axios';

import { type ICuratedWeaponScope } from '../../types';

import Entity from './entity';

interface IWeaponScopePayload {
  itemModifierId: string;
}

export default class WeaponScopes extends Entity {
  get: (payload: IWeaponScopePayload) => Promise<ICuratedWeaponScope>;

  constructor() {
    super('weaponscopes');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedWeaponScope);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
