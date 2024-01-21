import { model, type Model, Schema, type ObjectId, type HydratedDocument } from 'mongoose';

import type { IRuleBook, IChapterType, IPage } from '../index';

interface IChapter {
  /** The title of the ruleBook */
  title: string;
  /** A summary of the ruleBook */
  summary: string;
  /** The position of this chapter, in reference with others */
  position: number;
  /** The rulebook where this chapter is */
  ruleBook: ObjectId;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** The rulebook type */
  type: ObjectId | null;
  /** When the ruleBook was created */
  createdAt: Date;
}

interface HydratedIChapter extends Omit<HydratedDocument<IChapter>, 'type' | 'ruleBook'> {
  type: IChapterType;
  ruleBook: IRuleBook;
  pages: IPage[];
}

const chapterSchema = new Schema<IChapter>(
  {
    title: String,
    summary: String,
    i18n: String,
    position: Number,
    ruleBook: {
      type: Schema.Types.ObjectId,
      ref: 'RuleBook',
    },
    type: {
      type: Schema.Types.ObjectId,
      ref: 'ChapterType',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toJSON: { virtuals: true },
    // So `console.log()` and other functions that use `toObject()` include virtuals
    toObject: { virtuals: true },
  }
);

// Virtuals -------------------------

chapterSchema.virtual('pages', {
  ref: 'Page',
  localField: '_id',
  foreignField: 'chapter',
});

const ChapterModel = (): Model<IChapter> => model('Chapter', chapterSchema);

export { type IChapter, type HydratedIChapter, ChapterModel };
