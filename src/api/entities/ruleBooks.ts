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
  changeChapterOrder: (payload: IRuleBooksChapterOrder) => Promise<ICuratedRuleBook>;

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

    this.changeChapterOrder = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/changechapterorder/`, payload)
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
