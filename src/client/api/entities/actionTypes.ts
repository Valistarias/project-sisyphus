import axios from 'axios';

import Entity from './entity';

import type { IActionType } from '../../types';


interface IActionTypePayload {
  actionTypeId: string;
}

export default class ActionTypes extends Entity {
  get: (payload: IActionTypePayload) => Promise<IActionType>;

  constructor() {
    super('actiontypes');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as IActionType);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
