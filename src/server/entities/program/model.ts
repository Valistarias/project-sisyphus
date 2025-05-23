import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { Lean } from '../../utils/types';
import type { HydratedIDamage, HydratedINPC, IDamage, INPC } from '../index';

interface IProgram<IdType> {
  /** The title of the program */
  title: string;
  /** A summary of the program */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The rarity of the program */
  rarity: IdType;
  /** Is this weapon in the starter kit ?
   * (always -> element included, never -> not included, option -> can be chosen with similar weapons) */
  starterKit?: 'always' | 'never' | 'option';
  /** The type of item */
  itemType: IdType;
  /** The type of program, as his range or type */
  programScope: IdType;
  /** How many times the program is usable before detroying itseld (undefined | 0 = no limits) */
  uses: number;
  /** How many RAM it costs */
  ram: number;
  /** How many meters it blasts (in meter) */
  radius?: number;
  /** The cost of the program */
  cost: number;
  /** The challenge to use the program */
  challenge: number;
  /** The summon of the program */
  ai?: IdType;
  /** How many AIs the program summons */
  aiSummoned?: number;
  /** The damages of the program */
  damages?: IdType[];
  /** When the program was created */
  createdAt: Date;
}

type HydratedIProgram = HydratedDocument<
  Omit<IProgram<string>, 'damages' | 'ai'> & {
    damages: HydratedIDamage[] | string[];
    ai?: HydratedINPC | string;
  }
>;

type LeanIProgram = Omit<Lean<IProgram<string>>, 'damages' | 'ai'> & {
  damages: IDamage[];
  ai?: INPC;
};

const programSchema = new Schema<IProgram<ObjectId>>({
  title: String,
  summary: String,
  ram: Number,
  radius: Number,
  aiSummoned: Number,
  i18n: String,
  rarity: {
    type: Schema.Types.ObjectId,
    ref: 'Rarity',
  },
  starterKit: {
    type: String,
    default: 'never',
  },
  itemType: {
    type: Schema.Types.ObjectId,
    ref: 'ItemType',
  },
  programScope: {
    type: Schema.Types.ObjectId,
    ref: 'ProgramScope',
  },
  ai: {
    type: Schema.Types.ObjectId,
    ref: 'NPC',
  },
  damages: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Damage',
    },
  ],
  uses: Number,
  cost: Number,
  challenge: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ProgramModel = (): Model<IProgram<ObjectId>> => model('Program', programSchema);

export { ProgramModel, type HydratedIProgram, type IProgram, type LeanIProgram };
