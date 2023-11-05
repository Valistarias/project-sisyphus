import { model, type Model, Schema, type ObjectId, type HydratedDocument } from 'mongoose';
import { type IPageType } from '../index';

interface IPage {
  /** The title of the ruleBook */
  title: string;
  /** A content of the ruleBook */
  content: string;
  /** The position of this chapter, in reference with others */
  position: number;
  /** The chapter where this page is */
  chapter: ObjectId;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The rulebook type */
  type: ObjectId | null;
  /** When the ruleBook was created */
  createdAt: Date;
}

interface HydratedIPage extends Omit<HydratedDocument<IPage>, 'type'> {
  type: IPageType;
}

const ruleBookSchema = new Schema<IPage>({
  title: String,
  content: String,
  i18n: String,
  position: Number,
  chapter: {
    type: Schema.Types.ObjectId,
    ref: 'Chapter',
  },
  type: {
    type: Schema.Types.ObjectId,
    ref: 'PageType',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PageModel = (): Model<IPage> => model('Page', ruleBookSchema);

export { type IPage, type HydratedIPage, PageModel };
