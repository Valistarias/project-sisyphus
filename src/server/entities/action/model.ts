import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type {
  IActionDuration, IActionType, ISkill
} from '../index';

interface IAction {
  /** The title of the action */
  title: string
  /** A summary of the action */
  summary: string
  /** The internationnal content, as a json, stringified */
  i18n?: string
  /** The action type */
  type: ObjectId
  /** The action duration */
  duration: ObjectId
  /** Is this action a karma offering ? */
  isKarmic: boolean
  /** Cost of karma, if karmic offering */
  karmicCost?: number
  /** The time spent to execute this action */
  time?: string
  /** The skill associated to this action (for skill checks and attacks) */
  skill?: ObjectId
  /** The offset used for the skill check */
  offsetSkill?: string
  /** How many times the action is usable in a day */
  uses?: number
  /** The formula for the damages caused */
  damages?: string
  /** When the action was created */
  createdAt: Date
}

type HydratedIAction = HydratedDocument<
  Omit<IAction, 'type' | 'skill' | 'duration'> & {
    type: IActionType | ObjectId
    duration: IActionDuration | ObjectId
    skill: ISkill | ObjectId
  }
>;

const actionSchema = new Schema<IAction>({
  title: String,
  summary: String,
  i18n: String,
  type: {
    type: Schema.Types.ObjectId,
    ref: 'ActionType'
  },
  duration: {
    type: Schema.Types.ObjectId,
    ref: 'ActionDuration'
  },
  isKarmic: Boolean,
  karmicCost: Number,
  uses: Number,
  time: String,
  skill: {
    type: Schema.Types.ObjectId,
    ref: 'Skill'
  },
  offsetSkill: String,
  damages: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ActionModel = (): Model<IAction> => model('Action', actionSchema);

export {
  ActionModel, type HydratedIAction, type IAction
};
