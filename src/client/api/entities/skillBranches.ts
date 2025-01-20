import axios from 'axios';

import Entity from './entity';

import type { ICuratedSkillBranch, ISkillBranch } from '../../types';

interface ISkillBranchesPayload {
  skillId: string
}

interface ISkillBranchPayload {
  skillBranchId: string
}

export default class SkillBranches
  extends Entity<ISkillBranchPayload, ISkillBranch, ICuratedSkillBranch> {
  getAllBySkill: (payload: ISkillBranchesPayload) =>
  Promise<ICuratedSkillBranch[]>;

  constructor() {
    super('skillbranches');

    this.getAllBySkill = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/byskill/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedSkillBranch[]);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
