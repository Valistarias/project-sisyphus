import axios from 'axios';

import { type ICuratedProgram } from '../../types';

import Entity from './entity';

interface IProgramPayload {
  programId: string;
}

export default class Programs extends Entity {
  get: (payload: IProgramPayload) => Promise<ICuratedProgram>;
  getStarters: () => Promise<ICuratedProgram[]>;

  constructor() {
    super('programs');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedProgram);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.getStarters = async () =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/starter/`)
          .then((res) => {
            resolve(res.data as ICuratedProgram[]);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
