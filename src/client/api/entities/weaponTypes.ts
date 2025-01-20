import Entity from './entity';

import type { ICuratedWeaponType, IWeaponType } from '../../types';

interface IWeaponTypePayload {
  weaponTypeId: string
}

export default class WeaponTypes
  extends Entity<IWeaponTypePayload, IWeaponType, ICuratedWeaponType> {
  constructor() {
    super('weapontypes');
  }
}
