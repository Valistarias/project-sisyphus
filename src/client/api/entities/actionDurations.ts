import axios from 'axios';

import { type IActionDuration } from '../../types';

import Entity from './entity';

interface IActionDurationPayload {
  actionDurationId: string;
}

export default class ActionDurations extends Entity {
  get: (payload: IActionDurationPayload) => Promise<IActionDuration>;

  constructor() {
    super('actiondurations');

    this.get = async (payload) =>
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
