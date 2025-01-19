import axios from 'axios';

import Entity from './entity';

import type { IActionDuration } from '../../types';

interface IActionDurationPayload {
  actionDurationId: string
}

export default class ActionDurations
  extends Entity<IActionDuration, IActionDuration> {
  get: (payload: IActionDurationPayload) => Promise<IActionDuration>;

  constructor() {
    super('actiondurations');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as IActionDuration);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
