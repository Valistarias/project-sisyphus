import Entity from './entity';

import type { IAmmo, ICuratedAmmo } from '../../types';

interface IAmmoPayload {
  ammoId: string
}

export default class Ammos extends Entity<IAmmoPayload, IAmmo, ICuratedAmmo> {
  constructor() {
    super('ammos');
  }
}
