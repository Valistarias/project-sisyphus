import axios from 'axios';

import { type IBody } from '../../types';

import Entity from './entity';

interface IBodyPayload {
  characterId: string;
}

export default class Bodys extends Entity {
  get: (payload: IBodyPayload) => Promise<IBody>;

  constructor() {
    super('bodies');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as IBody);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
