import axios from 'axios';

import Entity from './entity';

import type { ICharacter } from '../../types';

interface ICharacterPayload {
  characterId: string
}

interface ICharacterAddNodePayload {
  characterId?: string
  nodeId: string
}

interface ICharacterUpdateNodesPayload {
  characterId?: string
  toAdd: string[]
  toRemove: string[]
}

export default class Characters extends Entity<ICharacter, ICharacter> {
  get: (payload: ICharacterPayload) => Promise<ICharacter>;
  addNode: (payload: ICharacterAddNodePayload) => Promise<ICharacter>;
  addFirstCyberFrameNode: (payload: ICharacterAddNodePayload) =>
  Promise<ICharacter>;

  updateNodes: (payload: ICharacterUpdateNodesPayload) => Promise<ICharacter>;
  quitCampaign: (payload: ICharacterPayload) => Promise<boolean>;

  constructor() {
    super('characters');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICharacter);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.addFirstCyberFrameNode = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/addfirstcyberframenode/`, payload)
          .then((res) => {
            resolve(res.data as ICharacter);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.addNode = async payload =>
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

    this.updateNodes = async payload =>
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

    this.quitCampaign = async payload =>
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
