import axios from 'axios';

import Entity from './entity';

import type {
  ICuratedBasicNPC, ICuratedNPC, INPC
} from '../../types';

interface INPCPayload {
  nPCId: string
}

export default class NPCs extends Entity<INPC, ICuratedNPC> {
  get: (payload: INPCPayload) => Promise<ICuratedNPC>;
  getAllBasic: () => Promise<ICuratedBasicNPC[]>;

  constructor() {
    super('npcs');

    this.get = async payload =>
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
