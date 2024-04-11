import { Schema, model, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import type { IActionType, ISkill } from '../index';

interface IAction {
  /** The title of the action */
  title: string;
  /** A summary of the action */
  summary: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The action type */
  type: ObjectId;
  /** The time spent to execute this action */
  time?: string;
  /** The skill associated to this action (for skill checks and attacks) */
  skill?: ObjectId;
  /** The offset used for the skill check */
  offsetSkill?: string;
  /** The formula for the damages caused */
  damages?: string;
  /** When the action was created */
  createdAt: Date;
}

interface HydratedIAction extends Omit<HydratedDocument<IAction>, 'type' | 'skill'> {
  type: IActionType;
  skill: ISkill;
}

const actionSchema = new Schema<IAction>({
  title: String,
  summary: String,
  i18n: String,
  type: {
    type: Schema.Types.ObjectId,
    ref: 'ActionType',
  },
  time: String,
  skill: {
    type: Schema.Types.ObjectId,
    ref: 'Skill',
  },
  offsetSkill: Number,
  damages: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ActionModel = (): Model<IAction> => model('Action', actionSchema);

export { ActionModel, type HydratedIAction, type IAction };
