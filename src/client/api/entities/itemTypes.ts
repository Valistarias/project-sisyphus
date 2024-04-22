import axios from 'axios';

import { type IItemType } from '../../types';

import Entity from './entity';

interface IItemTypesPayload {
  itemTypeId: string;
}

export default class ItemTypes extends Entity {
  get: (payload: IItemTypesPayload) => Promise<IItemType>;

  constructor() {
    super('itemtypes');

    this.get = async (payload) =>
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
