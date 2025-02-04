import Entity from './entity';

import type { IRuleBookType } from '../../types';

interface IRuleBooksTypesPayload {
  ruleBookTypeId: string;
}

export default class RuleBooksTypes extends Entity<
  IRuleBooksTypesPayload,
  IRuleBookType,
  IRuleBookType
> {
  constructor() {
    super('rulebooktypes');
  }
}
