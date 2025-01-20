import Entity from './entity';

import type { ICuratedSkill, ISkill } from '../../types';

export default class Skills extends Entity<unknown, ISkill, ICuratedSkill> {
  constructor() {
    super('skills');
  }
}
