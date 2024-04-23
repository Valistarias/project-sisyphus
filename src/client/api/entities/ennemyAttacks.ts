import axios from 'axios';

import { type ICuratedEnnemyAttack } from '../../types';

import Entity from './entity';

interface IEnnemyAttackPayload {
  ennemyAttackId: string;
}

export default class EnnemyAttacks extends Entity {
  get: (payload: IEnnemyAttackPayload) => Promise<ICuratedEnnemyAttack>;

  constructor() {
    super('ennemyattacks');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedEnnemyAttack);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
