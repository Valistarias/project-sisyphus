import axios from 'axios';

import Entity from './entity';

import type { IAction, ICuratedAction } from '../../types';

interface IActionPayload {
  actionId: string;
}

export default class Actions extends Entity<IActionPayload, IAction, ICuratedAction> {
  getBasics: () => Promise<ICuratedAction[]>;

  constructor() {
    super('actions');

    this.getBasics = async () =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/basics/`)
          .then((res) => {
            resolve(res.data as ICuratedAction[]);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
