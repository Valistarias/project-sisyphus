import axios from 'axios';

import { type ICuratedSkill } from '../../types';

import Entity from './entity';

interface ISkillPayload {
  skillId: string;
}

export default class Skills extends Entity {
  get: (payload: ISkillPayload) => Promise<ICuratedSkill>;

  constructor() {
    super('skills');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedSkill);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
