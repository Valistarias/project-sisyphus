import Entity from './entity';

import type { IDamage } from '../../types';

interface IDamagePayload {
  damageId: string
}

export default class Damages extends Entity<IDamagePayload, IDamage, IDamage> {
  constructor() {
    super('damages');
  }
}
