import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type IEnnemyAttack } from '../index';

interface INPC {
  /** The title of the NPC */
  title: string;
  /** A summary of the NPC */
  summary: string;
  /** Is the NPC virtual */
  virtual: boolean;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The land speed of the NPC (in meter) */
  speed: number;
  /** The flight speed of the NPC (in meter) */
  flightSpeed?: number;
  /** The swim speed of the NPC (in meter) */
  swimSpeed?: number;
  /** The HP of the NPC */
  hp: number;
  /** The physical resistance of the NPC */
  pr?: number;
  /** The ArtNet resistance of the NPC */
  ar: number;
  /** The attacks of the NPC */
  attacks: string[] | ObjectId[];
  /** When the NPC was created */
  createdAt: Date;
}

interface HydratedINPC extends Omit<HydratedDocument<INPC>, 'attacks'> {
  attacks: IEnnemyAttack[] | string[];
}

const nPCSchema = new Schema<INPC>({
  title: String,
  summary: String,
  i18n: String,
  speed: Number,
  virtual: {
    type: Boolean,
    default: false,
  },
  flightSpeed: Number,
  swimSpeed: Number,
  hp: Number,
  pr: Number,
  ar: Number,
  attacks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'EnnemyAttack',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const NPCModel = (): Model<INPC> => model('NPC', nPCSchema);

export { NPCModel, type HydratedINPC, type INPC };
