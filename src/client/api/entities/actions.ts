import Entity from './entity';

import type { IAction, ICuratedAction } from '../../types';

interface IActionPayload {
  actionId: string
}

export default class Actions
  extends Entity<IActionPayload, IAction, ICuratedAction> {
  constructor() {
    super('actions');
  }
}
