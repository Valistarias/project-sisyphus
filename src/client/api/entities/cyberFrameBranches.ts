import axios from 'axios';

import Entity from './entity';

import type { ICuratedCyberFrameBranch, ICyberFrameBranch } from '../../types';

interface ICyberFrameBranchesPayload {
  cyberFrameId: string
}

interface ICyberFrameBranchPayload {
  cyberFrameBranchId: string
}

export default class CyberFrameBranches
  extends Entity<ICyberFrameBranch, ICuratedCyberFrameBranch> {
  getAllByCyberFrame: (payload: ICyberFrameBranchesPayload) =>
  Promise<ICuratedCyberFrameBranch[]>;

  get: (payload: ICyberFrameBranchPayload) => Promise<ICuratedCyberFrameBranch>;

  constructor() {
    super('cyberframebranches');

    this.getAllByCyberFrame = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/byframe/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedCyberFrameBranch[]);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedCyberFrameBranch);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
