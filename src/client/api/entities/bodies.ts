import axios from 'axios';

import Entity from './entity';

import type { IBody } from '../../types';

interface ICreateBodyPayload {
  characterId?: string;
  cyberframeId: string;
}

interface IUpdateStatsPayload {
  id: string;
  stats: Array<{
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

export default class Bodies extends Entity<IBodyPayload, IBody, IBody> {
  create: (payload: ICreateBodyPayload) => Promise<string>;
  updateStats: (payload: IUpdateStatsPayload) => Promise<IBody>;
  resetItems: (payload: IResetItemsPayload) => Promise<IBody>;

  constructor() {
    super('bodies');

    this.updateStats = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/updatestats/`, payload)
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
