import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type INode } from '../../node/model';

interface ICharacterNode {
  /** When the character was created */
  createdAt: Date;
  /** The character targeted */
  character: ObjectId;
  /** The linked Node */
  node: ObjectId;
  /** How many time this node was used */
  used?: number;
}

type HydratedICharacterNode = HydratedDocument<
  Omit<ICharacterNode, 'node'> & {
    node: HydratedDocument<INode>;
  }
>;

const CharacterNodeSchema = new Schema<ICharacterNode>({
  character: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
  },
  node: {
    type: Schema.Types.ObjectId,
    ref: 'Node',
  },
  used: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CharacterNodeModel = (): Model<ICharacterNode> => model('CharacterNode', CharacterNodeSchema);

export { CharacterNodeModel, type HydratedICharacterNode, type ICharacterNode };
