import Entity from './entity';

import type { IItemType } from '../../types';

interface IItemTypesPayload {
  itemTypeId: string;
}

export default class ItemTypes extends Entity<IItemTypesPayload, IItemType, IItemType> {
  constructor() {
    super('itemtypes');
  }
}
