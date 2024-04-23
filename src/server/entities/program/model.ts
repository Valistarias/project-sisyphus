import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type IDamage, type INPC } from '../index';

interface IProgram {
  /** The title of the program */
  title: string;
  /** A summary of the program */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The rarity of the program */
  rarity: ObjectId;
  /** The type of item */
  itemType: ObjectId;
  /** The type of program, as his range or type */
  programScope: ObjectId;
  /** Is the program deleted after use */
  disposable: boolean;
  /** How many RAM it costs */
  ram: number;
  /** How many meters it blasts (in meter) */
  radius?: number;
  /** The cost of the program */
  cost: number;
  /** The summon of the program */
  ai?: ObjectId;
  /** The damages of the program */
  damages?: string[] | ObjectId[];
  /** When the program was created */
  createdAt: Date;
}

interface HydratedIProgram extends Omit<HydratedDocument<IProgram>, 'damages' | 'ai'> {
  damages: IDamage[] | string[];
  ai: INPC;
}

const programSchema = new Schema<IProgram>({
  title: String,
  summary: String,
  ram: Number,
  radius: Number,
  i18n: String,
  rarity: {
    type: Schema.Types.ObjectId,
    ref: 'Rarity',
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
    ref: 'AI',
  },
  damages: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Damage',
    },
  ],
  disposable: {
    type: Boolean,
    default: false,
  },
  cost: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ProgramModel = (): Model<IProgram> => model('Program', programSchema);

export { ProgramModel, type HydratedIProgram, type IProgram };
