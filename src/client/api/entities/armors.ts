import axios from 'axios';

import { type ICuratedArmor } from '../../types';

import Entity from './entity';

interface IArmorPayload {
  armorId: string;
}

export default class Armors extends Entity {
  get: (payload: IArmorPayload) => Promise<ICuratedArmor>;

  constructor() {
    super('armors');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedArmor);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
