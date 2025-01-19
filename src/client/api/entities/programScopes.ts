import axios from 'axios';

import Entity from './entity';

import type { ICuratedProgramScope, IProgramScope } from '../../types';

interface IProgramScopePayload {
  programScopeId: string
}

export default class ProgramScopes
  extends Entity<IProgramScope, ICuratedProgramScope> {
  get: (payload: IProgramScopePayload) => Promise<ICuratedProgramScope>;

  constructor() {
    super('programscopes');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedProgramScope);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
