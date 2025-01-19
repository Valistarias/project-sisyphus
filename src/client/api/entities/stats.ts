import axios from 'axios';

import Entity from './entity';

import type { ICuratedStat, IStat } from '../../types';

interface IStatPayload {
  statId: string
}

export default class Stats extends Entity<IStat, ICuratedStat> {
  get: (payload: IStatPayload) => Promise<ICuratedStat>;

  constructor() {
    super('stats');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedStat);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
