import axios from 'axios';

import { type IGlobalValue } from '../../types';

import Entity from './entity';

interface IGlobalValuesPayload {
  globalValueId: string;
}

export default class GlobalValues extends Entity {
  get: (payload: IGlobalValuesPayload) => Promise<IGlobalValue>;

  constructor() {
    super('globalvalues');

    this.get = async (payload) =>
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
