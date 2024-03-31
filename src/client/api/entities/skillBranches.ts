import axios from 'axios';

import { type ICuratedSkillBranch } from '../../types';

import Entity from './entity';

interface ISkillBranchesPayload {
  skillId: string;
}

interface ISkillBranchPayload {
  skillBranchId: string;
}

export default class SkillBranches extends Entity {
  getAllBySkill: (payload: ISkillBranchesPayload) => Promise<ICuratedSkillBranch[]>;
  get: (payload: ISkillBranchPayload) => Promise<ICuratedSkillBranch>;

  constructor() {
    super('skillbranches');

    this.getAllBySkill = async (payload) =>
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
