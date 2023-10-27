import Entity from './entity';

import axios from 'axios';

interface IRuleBookPayload {
  ruleBookId: string
};

export default class RuleBook extends Entity {
  get: (payload: IRuleBookPayload) => Promise<string>;

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
