import axios from 'axios';

import Entity from './entity';

import type { IBody } from '../../types';

interface ICreateBodyPayload {
  characterId?: string;
  cyberFrameId: string;
  hp: number;
}

interface IUpdateSkillsPayload {
  id: string;
  skills: Array<{
    id: string;
    value: number;
  }>;
}

interface IResetItemsPayload {
  id: string;
  weapons: string[];
  armors: string[];
  bags: string[];
  items: string[];
  programs: string[];
  implants: string[];
}
interface IBodyPayload {
  characterId: string;
}

export default class Bodies extends Entity<IBodyPayload, unknown, IBody> {
  create: (payload: ICreateBodyPayload) => Promise<string>;
  updateSkills: (payload: IUpdateSkillsPayload) => Promise<IBody>;
  resetItems: (payload: IResetItemsPayload) => Promise<IBody>;

  constructor() {
    super('bodies');

    this.updateSkills = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/updateskills/`, payload)
          .then((res) => {
            resolve(res.data as IBody);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.resetItems = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/resetitems/`, payload)
          .then((res) => {
            resolve(res.data as IBody);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.create = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/create/`, payload)
          .then((res) => {
            resolve(res.data as string);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
