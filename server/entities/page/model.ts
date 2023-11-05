import { model, type Model, Schema, type ObjectId, type HydratedDocument } from 'mongoose';

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
  /** When the ruleBook was created */
  createdAt: Date;
}

interface HydratedIPage extends HydratedDocument<IPage> {}

const ruleBookSchema = new Schema<IPage>({
  title: String,
  content: String,
  i18n: String,
  position: Number,
  chapter: {
    type: Schema.Types.ObjectId,
    ref: 'Chapter',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PageModel = (): Model<IPage> => model('Page', ruleBookSchema);

export { type IPage, type HydratedIPage, PageModel };
