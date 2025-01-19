import axios from 'axios';

import Entity from './entity';

import type { IArmorType, ICuratedArmorType } from '../../types';

interface IArmorTypePayload {
  armorTypeId: string
}

export default class ArmorTypes extends Entity<IArmorType, ICuratedArmorType> {
  get: (payload: IArmorTypePayload) => Promise<ICuratedArmorType>;

  constructor() {
    super('armortypes');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedArmorType);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
