import axios from 'axios';

import Entity from './entity';

import type { ICuratedProgram, IProgram } from '../../types';

interface IProgramPayload {
  programId: string
}

export default class Programs
  extends Entity<IProgramPayload, IProgram, ICuratedProgram> {
  getStarters: () => Promise<ICuratedProgram[]>;

  constructor() {
    super('programs');

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
