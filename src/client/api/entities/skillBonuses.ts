import axios from 'axios';

import { type ISkillBonus } from '../../types';

import Entity from './entity';

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
