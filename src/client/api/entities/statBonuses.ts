import Entity from './entity';

import type { IStatBonus } from '../../types';

export default class StatBonuses
  extends Entity<unknown, IStatBonus, IStatBonus> {
  constructor() {
    super('statbonuses');
  }
}
