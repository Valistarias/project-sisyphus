import Entity from './entity';

import type { IChapterType } from '../../types';

interface IChapterTypesPayload {
  ruleBookTypeId: string;
}

export default class ChapterTypes extends Entity<IChapterTypesPayload, IChapterType, IChapterType> {
  constructor() {
    super('chaptertypes');
  }
}
