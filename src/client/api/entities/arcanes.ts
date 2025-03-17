import Entity from './entity';

import type { IArcane, ICuratedArcane } from '../../types';

interface IArcanePayload {
  arcaneId: string;
}

export default class Arcanes extends Entity<IArcanePayload, IArcane, ICuratedArcane> {
  constructor() {
    super('arcanes');
  }
}
