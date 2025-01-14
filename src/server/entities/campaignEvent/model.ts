import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type { ICampaign } from '../campaign/model';
import type { ICharacter } from '../character';

interface ICampaignEvent {
  /*  The type of the campaign event */
  type: string
  /*  The numeral result of the campaign event */
  result: number
  /*  The formula, if any, of the campaign event */
  formula?: string
  /*  The character that had this event */
  character: ObjectId
  /*  The campaign associated with this campaign event */
  campaign: ObjectId
  /** When the campaign event was executed */
  createdAt: Date
}

type LeanICampaignEvent = Omit<ICampaignEvent, 'campaign' | 'character'> & {
  campaign: HydratedDocument<ICampaign>
  character: HydratedDocument<ICharacter>
};

type HydratedICampaignEvent = HydratedDocument<LeanICampaignEvent>;

const notionSchema = new Schema<ICampaignEvent>({
  result: Number,
  formula: String,
  type: String,
  character: {
    type: Schema.Types.ObjectId,
    ref: 'Character'
  },
  campaign: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CampaignEventModel = (): Model<ICampaignEvent> => model('CampaignEvent', notionSchema);

export {
  CampaignEventModel,
  type HydratedICampaignEvent,
  type ICampaignEvent,
  type LeanICampaignEvent
};
