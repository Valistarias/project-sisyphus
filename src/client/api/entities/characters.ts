import axios from 'axios';

import Entity from './entity';

import { type ICharacter } from '../../types/data';

interface ICharacterPayload {
  characterId: string;
}

type basicPayload = (payload: ICharacterPayload) => Promise<{ char: ICharacter }>;

export default class Characters extends Entity {
  get: (payload: ICharacterPayload) => Promise<ICharacter>;
  joinCampaign: basicPayload;
  quitCampaign: basicPayload;

  constructor() {
    super('characters');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.quitCampaign = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/quitcampaign/`, payload)
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
