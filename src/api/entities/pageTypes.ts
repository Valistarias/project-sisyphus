import Entity from './entity';

import axios from 'axios';

interface IPageTypesPayload {
  ruleBookTypeId: string;
}

export default class PageTypes extends Entity {
  get: (payload: IPageTypesPayload) => Promise<string>;

  constructor() {
    super('pagetypes');

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
  }
}
