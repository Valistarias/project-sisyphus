import axios from 'axios';

import { type ICuratedChapter } from '../../interfaces';
import Entity from './entity';

interface IChaptersPayload {
  chapterId: string;
}

export default class Chapters extends Entity {
  get: (payload: IChaptersPayload) => Promise<ICuratedChapter>;

  constructor() {
    super('chapters');

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
