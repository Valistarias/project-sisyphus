import axios from 'axios';

import Entity from './entity';

import type { IItemType } from '../../types';

interface IItemTypesPayload {
  itemTypeId: string
}

export default class ItemTypes extends Entity<IItemType, IItemType> {
  get: (payload: IItemTypesPayload) => Promise<IItemType>;

  constructor() {
    super('itemtypes');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as IItemType);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
