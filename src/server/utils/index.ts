import type { InternationalizationType } from './types';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- This type is neccessary for global typing
const safeJsonParse = <T>(str: string): T | undefined => {
  try {
    const jsonValue: T = JSON.parse(str);

    return jsonValue;
  } catch {
    return undefined;
  }
};

export const curateI18n = (i18n?: string): InternationalizationType | undefined => {
  if (i18n === '' || i18n === undefined) {
    return {};
  }

  return safeJsonParse<InternationalizationType>(i18n);
};
