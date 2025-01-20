import axios from 'axios';

import Entity from './entity';

import type { IArmor, ICuratedArmor } from '../../types';

interface IArmorPayload {
  armorId: string
}

export default class Armors
  extends Entity<IArmorPayload, IArmor, ICuratedArmor> {
  getStarters: () => Promise<ICuratedArmor[]>;

  constructor() {
    super('armors');

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
