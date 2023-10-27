import Entity from './entity';

import axios from 'axios';

interface INotionPayload {
  notionId: string
};

export default class Notion extends Entity {
  get: (payload: INotionPayload) => Promise<string>;

  constructor () {
    super('notions');

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
