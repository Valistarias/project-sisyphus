import { model, Schema, type HydratedDocument, type Model, type ObjectId } from 'mongoose';

import { type HydratedIChapter } from '../chapter/model';

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

type HydratedIPage = HydratedDocument<
  Omit<IPage, 'chapter'> & {
    chapter: HydratedIChapter;
  }
>;

const pageSchema = new Schema<IPage>({
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

const PageModel = (): Model<IPage> => model('Page', pageSchema);

export { PageModel, type HydratedIPage, type IPage };
