import Entity from './entity';

import type { ICuratedCyberFrame, ICyberFrame } from '../../types';

interface ICyberFramePayload {
  cyberFrameId: string
}

export default class CyberFrames
  extends Entity<ICyberFramePayload, ICyberFrame, ICuratedCyberFrame> {
  constructor() {
    super('cyberframes');
  }
}
