import Entity from './entity';

import type { ICuratedVow, IVow } from '../../types';

export default class Vows extends Entity<unknown, IVow, ICuratedVow> {
  constructor() {
    super('vows');
  }
}
