import Entity from './entity';

import type { ICuratedEffect, IEffect } from '../../types';

interface IEffectPayload {
  effectId: string
}

export default class Effects
  extends Entity<IEffectPayload, IEffect, ICuratedEffect> {
  constructor() {
    super('effects');
  }
}
