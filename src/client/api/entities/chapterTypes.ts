import axios from 'axios';

import Entity from './entity';

import type { IChapterType } from '../../types';

interface IChapterTypesPayload {
  ruleBookTypeId: string
}

export default class ChapterTypes extends Entity<IChapterType, IChapterType> {
  get: (payload: IChapterTypesPayload) => Promise<string>;

  constructor() {
    super('chaptertypes');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as string);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
