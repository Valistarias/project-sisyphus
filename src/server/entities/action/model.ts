import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { ISkill } from '../index';

interface IAction<IdType> {
  /** The title of the action */
  title: string;
  /** A summary of the action */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The action type */
  type: IdType;
  /** The action duration */
  duration: IdType;
  /** Is this action a karma offering ? */
  isKarmic: boolean;
  /** Cost of karma, if karmic offering */
  karmicCost?: number;
  /** The time spent to execute this action */
  time?: string;
  /** The skill associated to this action (for skill checks and attacks) */
  skill?: IdType;
  /** The offset used for the skill check */
  offsetSkill?: string;
  /** How many times the action is usable in a day */
  uses?: number;
  /** The formula for the damages caused */
  damages?: string;
  /** Is this action widely available for all characters ? */
  isBasic?: boolean;
  /** When the action was created */
  createdAt: Date;
}

type HydratedIAction = HydratedDocument<
  Omit<IAction<ObjectId | string>, 'skill'> & {
    skill?: HydratedDocument<ISkill> | ObjectId | string;
  }
>;

const actionSchema = new Schema<IAction<ObjectId>>({
  title: String,
  summary: String,
  i18n: String,
  type: {
    type: Schema.Types.ObjectId,
    ref: 'ActionType',
  },
  duration: {
    type: Schema.Types.ObjectId,
    ref: 'ActionDuration',
  },
  isKarmic: Boolean,
  isBasic: Boolean,
  karmicCost: Number,
  uses: Number,
  time: String,
  skill: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
  },
  offsetSkill: String,
  damages: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ActionModel = (): Model<IAction<ObjectId>> => model('Action', actionSchema);

export { ActionModel, type HydratedIAction, type IAction };
