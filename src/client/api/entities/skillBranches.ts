import axios from 'axios';

import { type ICuratedSkillBranch } from '../../types';

import Entity from './entity';

interface ISkillBranchPayload {
  skillBranchId: string;
}

export default class SkillBranches extends Entity {
  get: (payload: ISkillBranchPayload) => Promise<ICuratedSkillBranch>;

  constructor() {
    super('skillbranches');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedSkillBranch);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
