import { model, type Model, Schema } from 'mongoose';

interface IChapterType {
  name: string;
}

const ChapterTypeSchema = new Schema<IChapterType>({ name: String });

const ChapterTypeModel = (): Model<IChapterType> => model('ChapterType', ChapterTypeSchema);

export { type IChapterType, ChapterTypeModel };
