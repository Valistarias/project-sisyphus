import { Schema, model, type HydratedDocument, type Model } from 'mongoose';

import type { Lean } from '../../utils/types';

interface IArcane {
  /** The title of the arcane */
  title: string;
  /** A summary of the arcane */
  summary: string;
  /** The number on the arcane */
  number: number;
  /** The internationnal content, as a json, stringified */
  i18n?: string;
  /** When the arcane was created */
  createdAt: Date;
}

type HydratedIArcane = HydratedDocument<IArcane>;

type LeanIArcane = Lean<IArcane>;

const bodyPart = new Schema<IArcane>({
  title: String,
  summary: String,
  number: Number,
  i18n: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ArcaneModel = (): Model<IArcane> => model('Arcane', bodyPart);

export { ArcaneModel, type HydratedIArcane, type LeanIArcane, type IArcane };
