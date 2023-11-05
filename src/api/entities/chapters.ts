import axios from 'axios';

import { type ICuratedChapter } from '../../interfaces';
import Entity from './entity';

interface IChaptersPayload {
  ruleBookId: string;
}

interface IChapterPayload {
  chapterId: string;
}

export default class Chapters extends Entity {
  getAllByRuleBook: (payload: IChaptersPayload) => Promise<ICuratedChapter[]>;
  get: (payload: IChapterPayload) => Promise<ICuratedChapter>;

  constructor() {
    super('chapters');

    this.getAllByRuleBook = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/`, { params: payload })
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });

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
