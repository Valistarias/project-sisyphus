import axios from 'axios';

import { type ICharParamBonus } from '../../types';

import Entity from './entity';

interface ICharParamBonusPayload {
  charParamBonusId: string;
}

export default class CharParamBonuses extends Entity {
  get: (payload: ICharParamBonusPayload) => Promise<ICharParamBonus>;

  constructor() {
    super('charParambonuses');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICharParamBonus);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
