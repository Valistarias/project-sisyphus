import Entity from './entity';

import type { IBodyPart, ICuratedBodyPart } from '../../types';

interface IBodyPartPayload {
  bodyPartId: string
}

export default class BodyParts
  extends Entity<IBodyPartPayload, IBodyPart, ICuratedBodyPart> {
  constructor() {
    super('bodyparts');
  }
}
