import axios from 'axios';

import { type ICuratedAction } from '../../types';

import Entity from './entity';

interface IActionPayload {
  actionId: string;
}

export default class Actions extends Entity {
  get: (payload: IActionPayload) => Promise<ICuratedAction>;

  constructor() {
    super('actions');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedAction);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
