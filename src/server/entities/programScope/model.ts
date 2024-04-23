import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

interface IProgramScope {
  /** The title of the weapon scope */
  title: string;
  /** A summary of the weapon scope */
  summary: string;
  /** A 3 letter string used for displaying accurate range */
  scopeId: string;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** When the weapon scope was created */
  createdAt: Date;
}

interface HydratedIProgramScope extends HydratedDocument<IProgramScope> {}

const programScope = new Schema<IProgramScope>({
  title: String,
  summary: String,
  scopeId: String,
  i18n: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ProgramScopeModel = (): Model<IProgramScope> => model('ProgramScope', programScope);

export { ProgramScopeModel, type HydratedIProgramScope, type IProgramScope };
