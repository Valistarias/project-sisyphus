import axios from 'axios';

import Entity from './entity';

import type { ICuratedImplant, IImplant } from '../../types';

interface IImplantPayload {
  implantId: string;
}

export default class Implants extends Entity<IImplantPayload, IImplant, ICuratedImplant> {
  getStarters: () => Promise<ICuratedImplant[]>;

  constructor() {
    super('implants');

    this.getStarters = async () =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/starter/`)
          .then((res) => {
            resolve(res.data as ICuratedImplant[]);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
