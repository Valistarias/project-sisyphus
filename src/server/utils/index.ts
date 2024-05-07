export const curateI18n = (i18n?: string): Record<string, any> => {
  if (i18n === null || i18n === '' || i18n === undefined) {
    return {};
  }
  return JSON.parse(i18n);
};
