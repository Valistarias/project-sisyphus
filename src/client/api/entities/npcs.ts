import axios from 'axios';

import Entity from './entity';

import type { ICuratedBasicNPC, ICuratedNPC, INPC } from '../../types';

interface INPCPayload {
  nPCId: string;
}

export default class NPCs extends Entity<INPCPayload, INPC, ICuratedNPC> {
  getAllBasic: () => Promise<ICuratedBasicNPC[]>;

  constructor() {
    super('npcs');

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
