import Entity from './entity';

import type { ICuratedNode, INode } from '../../types';

interface INodePayload {
  nodeId: string;
}

export default class Nodes extends Entity<INodePayload, INode, ICuratedNode> {
  constructor() {
    super('nodes');
  }
}
