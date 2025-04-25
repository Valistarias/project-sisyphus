import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { HydratedIStat } from '../../stat/model';

interface ICharacterStat {
  /** When the character was created */
  createdAt: Date;
  /** The character targeted */
  character: ObjectId;
  /** The linked Stat */
  stat: ObjectId;
  /** What is the actual value of this stat */
  value: number;
}

type HydratedICharacterStat = HydratedDocument<
  Omit<ICharacterStat, 'stat'> & { stat: HydratedIStat }
>;

const CharacterStatSchema = new Schema<ICharacterStat>({
  character: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
  },
  stat: {
    type: Schema.Types.ObjectId,
    ref: 'Stat',
  },
  value: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CharacterStatModel = (): Model<ICharacterStat> => model('CharacterStat', CharacterStatSchema);

export { CharacterStatModel, type HydratedICharacterStat, type ICharacterStat };
