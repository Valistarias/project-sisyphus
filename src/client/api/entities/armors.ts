import axios from 'axios';

import Entity from './entity';

import type { ICuratedArmor } from '../../types';

interface IArmorPayload {
  armorId: string
}

export default class Armors extends Entity {
  get: (payload: IArmorPayload) => Promise<ICuratedArmor>;
  getStarters: () => Promise<ICuratedArmor[]>;

  constructor() {
    super('armors');

    this.get = async payload =>
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

    this.getStarters = async () =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/starter/`)
          .then((res) => {
            resolve(res.data as ICuratedArmor[]);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
