import Entity from './entity';

import type { ICharParamBonus } from '../../types';

interface ICharParamBonusPayload {
  charParamBonusId: string
}

export default class CharParamBonuses
  extends Entity<ICharParamBonusPayload, ICharParamBonus, ICharParamBonus> {
  constructor() {
    super('charParambonuses');
  }
}
