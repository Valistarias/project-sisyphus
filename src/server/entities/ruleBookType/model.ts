import {
  type HydratedDocument,
  model, type Model, Schema
} from 'mongoose';

interface IRuleBookType {
  name: string
}

export type HydratedIRuleBookType = HydratedDocument<IRuleBookType>;

const RuleBookTypeSchema = new Schema<IRuleBookType>({ name: String });

const RuleBookTypeModel = (): Model<IRuleBookType> => model('RuleBookType', RuleBookTypeSchema);

export {
  type IRuleBookType, RuleBookTypeModel
};
