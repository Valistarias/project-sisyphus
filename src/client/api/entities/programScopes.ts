import Entity from './entity';

import type { ICuratedProgramScope, IProgramScope } from '../../types';

interface IProgramScopePayload {
  programScopeId: string
}

export default class ProgramScopes
  extends Entity<IProgramScopePayload, IProgramScope, ICuratedProgramScope> {
  constructor() {
    super('programscopes');
  }
}
