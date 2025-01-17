import axios from 'axios';

import Entity from './entity';

import type { IRuleBookType } from '../../types';

interface IRuleBooksTypesPayload {
  ruleBookTypeId: string
}

export default class RuleBooksTypes extends Entity<IRuleBookType> {
  get: (payload: IRuleBooksTypesPayload) => Promise<string>;

  constructor() {
    super('rulebooktypes');

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
