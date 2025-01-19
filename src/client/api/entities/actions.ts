import axios from 'axios';

import Entity from './entity';

import type { IAction, ICuratedAction } from '../../types';

interface IActionPayload {
  actionId: string
}

export default class Actions extends Entity<IAction, ICuratedAction> {
  get: (payload: IActionPayload) => Promise<ICuratedAction>;

  constructor() {
    super('actions');

    this.get = async payload =>
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
