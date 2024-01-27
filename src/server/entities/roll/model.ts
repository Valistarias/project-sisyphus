import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type ICampaign } from '../campaign/model';
import { type ICharacter } from '../character/model';

interface IRoll {
  /*  The type of the roll */
  type: string;
  /*  The result of the roll */
  result: number;
  /*  The formula of the roll */
  formula: string;
  /*  The character that rolled */
  character: ObjectId;
  /*  The campaign associated with this roll */
  campaign: ObjectId;
  /** When the roll was executed */
  createdAt: Date;
}

interface HydratedRoll extends Omit<HydratedDocument<IRoll>, 'campaign' | 'character'> {
  campaign: HydratedDocument<ICampaign>;
  character: HydratedDocument<ICharacter>;
}

const notionSchema = new Schema<IRoll>({
  result: Number,
  formula: String,
  type: String,
  character: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
  },
  campaign: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RollModel = (): Model<IRoll> => model('Roll', notionSchema);

export { RollModel, type HydratedRoll, type IRoll };
