import { Schema, model, type Model } from 'mongoose';

interface IActionDuration {
  name: string
}

const ActionDurationSchema = new Schema<IActionDuration>({
  name: String
});

const ActionDurationModel = (): Model<IActionDuration> =>
  model('ActionDuration', ActionDurationSchema);

export { ActionDurationModel, type IActionDuration };
