import axios from 'axios';

import { type ICuratedBasicNPC, type ICuratedNPC } from '../../types';

import Entity from './entity';

interface INPCPayload {
  nPCId: string;
}

export default class NPCs extends Entity {
  get: (payload: INPCPayload) => Promise<ICuratedNPC>;
  getAllBasic: () => Promise<ICuratedBasicNPC[]>;

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

    this.getAllBasic = async () =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/basic/`)
          .then((res) => {
            resolve(res.data as ICuratedBasicNPC[]);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
