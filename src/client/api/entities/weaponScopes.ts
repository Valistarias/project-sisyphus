import Entity from './entity';

import type { ICuratedWeaponScope, IWeaponScope } from '../../types';

interface IWeaponScopePayload {
  weaponScopeId: string
}

export default class WeaponScopes
  extends Entity<IWeaponScopePayload, IWeaponScope, ICuratedWeaponScope> {
  constructor() {
    super('weaponscopes');
  }
}
