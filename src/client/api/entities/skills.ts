import axios from 'axios';

import Entity from './entity';

import type { ICuratedSkill, ISkill } from '../../types';

interface ISkillPayload {
  skillId: string
}

export default class Skills extends Entity<ISkill, ICuratedSkill> {
  get: (payload: ISkillPayload) => Promise<ICuratedSkill>;

  constructor() {
    super('skills');

    this.get = async payload =>
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
