import Entity from './entity';

import axios from 'axios';

interface IRuleBooksPayload {
  ruleBookId: string
};

export default class RuleBooks extends Entity {
  get: (payload: IRuleBooksPayload) => Promise<string>;

  constructor () {
    super('rulebooks');

    this.get = async (payload) => await new Promise((resolve, reject) => {
      axios.get(`${this.url}/single/`, { params: payload })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}
