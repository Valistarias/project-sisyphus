export const fullTrim = (elt: string): string => elt.replace(/\s+/g, ' ').trim();

export const classTrim = (elt: string): string => fullTrim(elt.replace(/\n {2,}/g, ' '));

export const regexMail = /([A-z0-9._%-])+@([A-z0-9.-])+\.([A-z0-9]{2,})/g;

export const arraysEqual = (a: string[], b: string[]): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export interface IFormattedDate {
  date: string;
  hour: string;
}

export const formatDate = (date: Date): IFormattedDate => ({
  date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
  hour: `${date.getHours()}:${date.getMinutes()}`,
});
