import Entity from './entity';

import type { ICuratedEnnemyAttack, IEnnemyAttack } from '../../types';

interface IEnnemyAttackPayload {
  ennemyAttackId: string
}

export default class EnnemyAttacks
  extends Entity<IEnnemyAttackPayload, IEnnemyAttack, ICuratedEnnemyAttack> {
  constructor() {
    super('ennemyattacks');
  }
}
