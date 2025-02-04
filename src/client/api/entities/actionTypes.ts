import Entity from './entity';

import type { IActionType } from '../../types';

interface IActionTypePayload {
  actionTypeId: string;
}

export default class ActionTypes extends Entity<IActionTypePayload, IActionType, IActionType> {
  constructor() {
    super('actiontypes');
  }
}
