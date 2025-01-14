import axios from 'axios';

import Entity from './entity';

import type { ICuratedItemModifier } from '../../types';

interface IItemModifierPayload {
  itemModifierId: string
}

export default class ItemModifiers extends Entity {
  get: (payload: IItemModifierPayload) => Promise<ICuratedItemModifier>;

  constructor() {
    super('itemmodifiers');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedItemModifier);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
