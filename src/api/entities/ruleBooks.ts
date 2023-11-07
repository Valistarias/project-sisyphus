import axios from 'axios';

import { type ICuratedRuleBook } from '../../interfaces';
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

export default class RuleBooks extends Entity {
  get: (payload: IRuleBooksPayload) => Promise<ICuratedRuleBook>;
  changeChaptersOrder: (payload: IRuleBooksChapterOrder) => Promise<ICuratedRuleBook>;

  constructor() {
    super('rulebooks');

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

    this.changeChaptersOrder = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/changechaptersorder/`, payload)
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
