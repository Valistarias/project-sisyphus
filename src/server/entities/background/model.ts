import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type {
  ICharParamBonus, ISkillBonus, IStatBonus
} from '../index';

interface IBackground {
  /** The title of the Background */
  title: string
  /** A summary of the Background */
  summary: string
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** The skill bonuses related to the Background */
  skillBonuses?: string[] | ObjectId[]
  /** The stat bonuses related to the Background */
  statBonuses?: string[] | ObjectId[]
  /** The charParam bonuses related to the Background */
  charParamBonuses?: string[] | ObjectId[]
  /** When the Background was created */
  createdAt: Date
}

type HydratedIBackground = HydratedDocument<
  Omit<IBackground, 'skillBonuses' | 'statBonuses' | 'charParamBonuses'> & {
    skillBonuses: ISkillBonus[] | string[]
    statBonuses: IStatBonus[] | string[]
    charParamBonuses: ICharParamBonus[] | string[]
  }
>;

const backgroundSchema = new Schema<IBackground>({
  title: String,
  summary: String,
  i18n: String,
  skillBonuses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'SkillBonus'
    }
  ],
  statBonuses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'StatBonus'
    }
  ],
  charParamBonuses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'CharParamBonus'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const BackgroundModel = (): Model<IBackground> => model('Background', backgroundSchema);

export {
  BackgroundModel, type HydratedIBackground, type IBackground
};
