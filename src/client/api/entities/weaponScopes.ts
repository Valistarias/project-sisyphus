import axios from 'axios';

import Entity from './entity';

import type { ICuratedWeaponScope } from '../../types';


interface IWeaponScopePayload {
  weaponScopeId: string;
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
