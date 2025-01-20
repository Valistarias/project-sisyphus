import Entity from './entity';

import type { ISkillBonus } from '../../types';

interface ISkillBonusPayload {
  skillBonusId: string
}

export default class SkillBonuses
  extends Entity<ISkillBonusPayload, ISkillBonus, ISkillBonus> {
  constructor() {
    super('skillbonuses');
  }
}
