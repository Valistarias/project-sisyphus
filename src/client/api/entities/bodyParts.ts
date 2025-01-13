import axios from 'axios';

import Entity from './entity';

import type { ICuratedBodyPart } from '../../types';


interface IBodyPartPayload {
  bodyPartId: string;
}

export default class BodyParts extends Entity {
  get: (payload: IBodyPartPayload) => Promise<ICuratedBodyPart>;

  constructor() {
    super('bodyparts');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedBodyPart);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
