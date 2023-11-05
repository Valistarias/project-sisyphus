import { model, type Model, Schema } from 'mongoose';

interface IPageType {
  name: string;
}

const PageTypeSchema = new Schema<IPageType>({
  name: String,
});

const PageTypeModel = (): Model<IPageType> => model('PageType', PageTypeSchema);

export { type IPageType, PageTypeModel };
