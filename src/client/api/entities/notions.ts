import axios from 'axios';

import Entity from './entity';

import type { ICuratedNotion, INotion } from '../../types';

interface INotionsPayload {
  notionId: string
}

interface IRulebookPayload {
  ruleBookId?: string
}

export default class Notions
  extends Entity<INotionsPayload, INotion, ICuratedNotion> {
  getAllByRuleBook: (payload: IRulebookPayload) => Promise<ICuratedNotion[]>;

  constructor() {
    super('notions');

    this.getAllByRuleBook = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/byrulebook/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedNotion[]);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
