import axios from 'axios';

import Entity from './entity';

import type { ICuratedPage, IPage } from '../../types';

interface IPagesPayload {
  pageId: string;
}

interface IChapterPayload {
  chapterId: string;
}

export default class Pages extends Entity<IPagesPayload, IPage, ICuratedPage> {
  getAllByChapter: (payload: IChapterPayload) => Promise<ICuratedPage[]>;

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
  }
}
