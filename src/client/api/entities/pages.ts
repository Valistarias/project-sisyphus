import axios from 'axios';

import Entity from './entity';

import type { ICuratedPage } from '../../types';


interface IPagesPayload {
  pageId: string;
}

interface IChapterPayload {
  chapterId: string;
}

export default class Pages extends Entity {
  getAllByChapter: (payload: IChapterPayload) => Promise<ICuratedPage[]>;
  get: (payload: IPagesPayload) => Promise<ICuratedPage>;

  constructor() {
    super('pages');

    this.getAllByChapter = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/pagesbychapterid/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedPage[]);
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
            resolve(res.data as ICuratedPage);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
