import axios from 'axios';

import Entity from './entity';

import type { ICuratedNode, INode } from '../../types';

interface IBranchPayload {
  cyberFrameBranchId?: string;
  skillBranchId?: string;
}

interface INodePayload {
  nodeId: string;
}

export default class Nodes extends Entity<INodePayload, INode, ICuratedNode> {
  getAllByBranch: (payload: IBranchPayload) => Promise<ICuratedNode[]>;
  getAllBySkill: (payload: { skillId: string }) => Promise<ICuratedNode[]>;
  getAllByCyberFrame: (payload: { cyberFrameId: string }) => Promise<ICuratedNode[]>;

  constructor() {
    super('nodes');

    this.getAllByBranch = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/bybranch/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedNode[]);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.getAllBySkill = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/byskill/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedNode[]);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.getAllByCyberFrame = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/bycyberframe/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedNode[]);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
