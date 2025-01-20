import Entity from './entity';

import type { ICuratedItemModifier, IItemModifier } from '../../types';

interface IItemModifierPayload {
  itemModifierId: string
}

export default class ItemModifiers
  extends Entity<IItemModifierPayload, IItemModifier, ICuratedItemModifier> {
  constructor() {
    super('itemmodifiers');
  }
}
