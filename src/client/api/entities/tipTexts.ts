import Entity from './entity';

import type { ICuratedTipText, ITipText } from '../../types';

export default class TipTexts extends Entity<unknown, ITipText, ICuratedTipText> {
  constructor() {
    super('tiptexts');
  }
}
