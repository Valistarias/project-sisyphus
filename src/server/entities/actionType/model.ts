import { Schema, model, type Model } from 'mongoose';

interface IActionType {
  name: string;
}

const ActionTypeSchema = new Schema<IActionType>({
  name: String,
});

const ActionTypeModel = (): Model<IActionType> => model('ActionType', ActionTypeSchema);

export { ActionTypeModel, type IActionType };
