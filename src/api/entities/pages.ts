import axios from 'axios';

import { type ICuratedPage } from '../../interfaces';
import Entity from './entity';

interface IPagesPayload {
  chapterId: string;
}

export default class Pages extends Entity {
  get: (payload: IPagesPayload) => Promise<ICuratedPage>;

  constructor() {
    super('pages');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
