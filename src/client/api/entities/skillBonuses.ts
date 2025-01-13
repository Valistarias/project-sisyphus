import axios from 'axios';

import Entity from './entity';

import type { ISkillBonus } from '../../types';


interface ISkillBonusPayload {
  skillBonusId: string;
}

export default class SkillBonuses extends Entity {
  get: (payload: ISkillBonusPayload) => Promise<ISkillBonus>;

  constructor() {
    super('skillbonuses');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ISkillBonus);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
