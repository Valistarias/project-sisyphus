import axios from 'axios';

import Entity from './entity';

import type { ICuratedImplant, IImplant } from '../../types';

interface IImplantPayload {
  implantId: string
}

export default class Implants extends Entity<IImplant> {
  get: (payload: IImplantPayload) => Promise<ICuratedImplant>;
  getStarters: () => Promise<ICuratedImplant[]>;

  constructor() {
    super('implants');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedImplant);
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
            resolve(res.data as ICuratedImplant[]);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
