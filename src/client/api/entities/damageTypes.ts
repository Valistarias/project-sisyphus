import Entity from './entity';

import type { ICuratedDamageType, IDamageType } from '../../types';

interface IDamageTypePayload {
  damageTypeId: string;
}

export default class DamageTypes extends Entity<
  IDamageTypePayload,
  IDamageType,
  ICuratedDamageType
> {
  constructor() {
    super('damagetypes');
  }
}
