import axios from 'axios';

import { type ICuratedNPC } from '../../types';

import Entity from './entity';

interface INPCPayload {
  nPCId: string;
}

export default class NPCs extends Entity {
  get: (payload: INPCPayload) => Promise<ICuratedNPC>;

  constructor() {
    super('npcs');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedNPC);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
