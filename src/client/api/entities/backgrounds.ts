import axios from 'axios';

import { type ICuratedBackground } from '../../types';

import Entity from './entity';

interface IBackgroundPayload {
  backgroundId: string;
}

export default class Backgrounds extends Entity {
  get: (payload: IBackgroundPayload) => Promise<ICuratedBackground>;

  constructor() {
    super('backgrounds');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedBackground);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
