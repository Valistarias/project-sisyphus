import axios from 'axios';

import Entity from './entity';

import { type ICuratedChapter } from '../../interfaces';


interface IChaptersPayload {
  ruleBookId: string;
}

interface IChapterPayload {
  chapterId: string;
}

interface IChapterPagesOrder {
  id: string;
  order: Array<{
    id: string;
    position: number;
  }>;
}

export default class Chapters extends Entity {
  getAllByRuleBook: (payload: IChaptersPayload) => Promise<ICuratedChapter[]>;
  get: (payload: IChapterPayload) => Promise<ICuratedChapter>;
  changePagesOrder: (payload: IChapterPagesOrder) => Promise<ICuratedChapter>;

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

    this.changePagesOrder = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/changepagesorder/`, payload)
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
