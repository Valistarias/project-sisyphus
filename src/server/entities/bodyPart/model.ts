import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

interface IBodyPart {
  /** The title of the body part */
  title: string;
  /** A summary of the body part */
  summary: string;
  /** A 3 letter string used for displaying properly */
  partId: string;
  /** How many implants a user can have on this body part */
  limit: number;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** When the body part was created */
  createdAt: Date;
}

interface HydratedIBodyPart extends HydratedDocument<IBodyPart> {}

const bodyPart = new Schema<IBodyPart>({
  title: String,
  summary: String,
  partId: String,
  limit: Number,
  i18n: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const BodyPartModel = (): Model<IBodyPart> => model('BodyPart', bodyPart);

export { BodyPartModel, type HydratedIBodyPart, type IBodyPart };
