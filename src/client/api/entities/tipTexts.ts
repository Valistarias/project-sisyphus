import axios from 'axios';

import Entity from './entity';

import type { ICuratedTipText } from '../../types';

interface ITipTextPayload {
  tipTextId: string
}

export default class TipTexts extends Entity {
  get: (payload: ITipTextPayload) => Promise<ICuratedTipText>;

  constructor() {
    super('tiptexts');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedTipText);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
