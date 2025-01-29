// Global Types ------------------------------------
export type InternationalizationType = Record<string, Record<string, string>>;

export type Lean<T> = T & {
  _id: string
};
