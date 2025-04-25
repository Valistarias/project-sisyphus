import axios from 'axios';

import Entity from './entity';

import type { ICharacter } from '../../types';

interface ICharacterPayload {
  characterId: string;
}

interface ICharacterAddNodePayload {
  characterId?: string;
  nodeId: string;
}

interface IUpdateStatsPayload {
  id: string;
  stats: Array<{
    id: string;
    value: number;
  }>;
}

interface ICharacterUpdateNodesPayload {
  characterId?: string;
  toAdd: string[];
  toRemove: string[];
}

export default class Characters extends Entity<ICharacterPayload, ICharacter, ICharacter> {
  addNode: (payload: ICharacterAddNodePayload) => Promise<ICharacter>;
  updateStats: (payload: IUpdateStatsPayload) => Promise<ICharacter>;
  updateNodes: (payload: ICharacterUpdateNodesPayload) => Promise<ICharacter>;
  quitCampaign: (payload: ICharacterPayload) => Promise<boolean>;

  constructor() {
    super('characters');

    this.updateStats = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/updatestats/`, payload)
          .then((res) => {
            resolve(res.data as ICharacter);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.addNode = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/addnode/`, payload)
          .then((res) => {
            resolve(res.data as ICharacter);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.updateNodes = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/updatenodes/`, payload)
          .then((res) => {
            resolve(res.data as ICharacter);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.quitCampaign = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/quitcampaign/`, payload)
          .then(() => {
            resolve(true);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
