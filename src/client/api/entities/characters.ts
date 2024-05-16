import axios from 'axios';

import { type ICharacter } from '../../types';

import Entity from './entity';

interface ICharacterPayload {
  characterId: string;
}

interface ICharacterAddNodePayload {
  characterId?: string;
  nodeId: string;
}

export default class Characters extends Entity {
  get: (payload: ICharacterPayload) => Promise<ICharacter>;
  addNode: (payload: ICharacterAddNodePayload) => Promise<ICharacter>;
  quitCampaign: (payload: ICharacterPayload) => Promise<boolean>;

  constructor() {
    super('characters');

    this.get = async (payload) =>
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
