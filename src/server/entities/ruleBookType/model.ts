import { model, type Model, Schema } from 'mongoose';

interface IRuleBookType {
  name: string;
}

const RuleBookTypeSchema = new Schema<IRuleBookType>({
  name: String,
});

const RuleBookTypeModel = (): Model<IRuleBookType> => model('RuleBookType', RuleBookTypeSchema);

export { type IRuleBookType, RuleBookTypeModel };
