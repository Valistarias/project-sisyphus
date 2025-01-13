import axios from 'axios';

import Entity from './entity';

import type { IStatBonus } from '../../types';

interface IStatBonusPayload {
  statBonusId: string
}

export default class StatBonuses extends Entity {
  get: (payload: IStatBonusPayload) => Promise<IStatBonus>;

  constructor() {
    super('statbonuses');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as IStatBonus);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
