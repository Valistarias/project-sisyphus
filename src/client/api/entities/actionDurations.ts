import Entity from './entity';

import type { IActionDuration } from '../../types';

interface IActionDurationPayload {
  actionDurationId: string
}

export default class ActionDurations
  extends Entity<IActionDurationPayload, IActionDuration, IActionDuration> {
  constructor() {
    super('actiondurations');
  }
}
