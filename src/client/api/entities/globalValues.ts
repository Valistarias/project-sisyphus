import axios from 'axios';

import Entity from './entity';

import type { IGlobalValue } from '../../types';

interface IGlobalValuesPayload {
  globalValueId: string
}

export default class GlobalValues extends Entity<IGlobalValue, IGlobalValue> {
  get: (payload: IGlobalValuesPayload) => Promise<IGlobalValue>;

  constructor() {
    super('globalvalues');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as IGlobalValue);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
