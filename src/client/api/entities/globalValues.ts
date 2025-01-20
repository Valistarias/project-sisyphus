import Entity from './entity';

import type { IGlobalValue } from '../../types';

interface IGlobalValuesPayload {
  globalValueId: string
}

export default class GlobalValues
  extends Entity<IGlobalValuesPayload, IGlobalValue, IGlobalValue> {
  constructor() {
    super('globalvalues');
  }
}
