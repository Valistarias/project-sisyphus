import axios from 'axios';

import { type ICuratedNode } from '../../types';

import Entity from './entity';

interface INodePayload {
  nodeId: string;
}

export default class Nodes extends Entity {
  get: (payload: INodePayload) => Promise<ICuratedNode>;

  constructor() {
    super('nodes');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedNode);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
