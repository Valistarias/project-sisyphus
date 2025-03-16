import type { Types } from 'mongoose';

// Global Types ------------------------------------
export type InternationalizationType = Record<string, Record<string, string>>;

export type Lean<T> = T & {
  _id: string | Types.ObjectId;
};
