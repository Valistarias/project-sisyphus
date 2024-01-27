import axios from 'axios';

import { type ICuratedNotion } from '../../types/data';

import Entity from './entity';

interface INotionsPayload {
  notionId: string;
}

interface IRulebookPayload {
  ruleBookId?: string;
}

export default class Notions extends Entity {
  get: (payload: INotionsPayload) => Promise<ICuratedNotion>;
  getAllByRuleBook: (payload: IRulebookPayload) => Promise<ICuratedNotion[]>;

  constructor() {
    super('notions');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedNotion);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.getAllByRuleBook = async (payload) =>
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
