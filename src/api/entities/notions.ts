import axios from 'axios';

import { type ICuratedNotion } from '../../interfaces';
import Entity from './entity';

interface INotionsPayload {
  notionId: string
};

export default class Notions extends Entity {
  get: (payload: INotionsPayload) => Promise<ICuratedNotion>;

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
