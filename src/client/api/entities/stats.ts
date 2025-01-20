import Entity from './entity';

import type { ICuratedStat, IStat } from '../../types';

export default class Stats extends Entity<unknown, IStat, ICuratedStat> {
  constructor() {
    super('stats');
  }
}
