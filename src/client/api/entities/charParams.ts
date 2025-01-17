import axios from 'axios';

import Entity from './entity';

import type { ICharParam, ICuratedCharParam } from '../../types';

interface ICharParamPayload {
  charParamId: string
}

export default class CharParams extends Entity<ICharParam> {
  get: (payload: ICharParamPayload) => Promise<ICuratedCharParam>;

  constructor() {
    super('charParams');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedCharParam);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
