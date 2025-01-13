import axios from 'axios';

import Entity from './entity';

import type { ICuratedCyberFrame } from '../../types';

interface ICyberFramePayload {
  cyberFrameId: string
}

export default class CyberFrames extends Entity {
  get: (payload: ICyberFramePayload) => Promise<ICuratedCyberFrame>;

  constructor() {
    super('cyberframes');

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data as ICuratedCyberFrame);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
