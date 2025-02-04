import Entity from './entity';

import type { IBackground, ICuratedBackground } from '../../types';

interface IBackgroundPayload {
  backgroundId: string;
}

export default class Backgrounds extends Entity<
  IBackgroundPayload,
  IBackground,
  ICuratedBackground
> {
  constructor() {
    super('backgrounds');
  }
}
