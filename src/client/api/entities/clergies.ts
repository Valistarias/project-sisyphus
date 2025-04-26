import Entity from './entity';

import type { ICuratedClergy, IClergy } from '../../types';

export default class Clergies extends Entity<unknown, IClergy, ICuratedClergy> {
  constructor() {
    super('clergies');
  }
}
