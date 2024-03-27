import axios from 'axios';

import { type ICuratedRuleBook } from '../../types';

import Entity from './entity';

interface IRuleBooksPayload {
  ruleBookId: string;
}

interface IRuleBooksChapterOrder {
  id: string;
  order: Array<{
    id: string;
    position: number;
  }>;
}

interface IArchivedPayload {
  id: string;
  archived: boolean;
}

export default class RuleBooks extends Entity {
  get: (payload: IRuleBooksPayload) => Promise<ICuratedRuleBook>;
  archive: (payload: IArchivedPayload) => Promise<boolean>;
  changeChaptersOrder: (payload: IRuleBooksChapterOrder) => Promise<ICuratedRuleBook>;

  constructor() {
    super('rulebooks');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedRuleBook | PromiseLike<ICuratedRuleBook>);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.changeChaptersOrder = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/changechaptersorder/`, payload)
          .then((res) => {
            resolve(res.data as ICuratedRuleBook | PromiseLike<ICuratedRuleBook>);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.archive = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/archive/`, payload)
          .then((res) => {
            resolve(res.data as boolean | PromiseLike<boolean>);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
