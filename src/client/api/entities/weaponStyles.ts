import Entity from './entity';

import type { ICuratedWeaponStyle, IWeaponStyle } from '../../types';

interface IWeaponStylePayload {
  weaponStyleId: string;
}

export default class WeaponStyles extends Entity<
  IWeaponStylePayload,
  IWeaponStyle,
  ICuratedWeaponStyle
> {
  constructor() {
    super('weaponstyles');
  }
}
