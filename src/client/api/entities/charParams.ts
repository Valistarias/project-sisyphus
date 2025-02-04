import Entity from './entity';

import type { ICharParam, ICuratedCharParam } from '../../types';

interface ICharParamPayload {
  charParamId: string;
}

export default class CharParams extends Entity<ICharParamPayload, ICharParam, ICuratedCharParam> {
  constructor() {
    super('charParams');
  }
}
