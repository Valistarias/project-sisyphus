import Entity from './entity';

import type { IArmorType, ICuratedArmorType } from '../../types';

interface IArmorTypePayload {
  armorTypeId: string;
}

export default class ArmorTypes extends Entity<IArmorTypePayload, IArmorType, ICuratedArmorType> {
  constructor() {
    super('armortypes');
  }
}
