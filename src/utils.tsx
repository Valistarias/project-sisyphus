export const fullTrim = (elt: string): string => elt.replace(/\s+/g, ' ').trim();

export const classTrim = (elt: string): string => fullTrim(elt.replace(/\n {2,}/g, ' '));

export const regexMail = /([A-z0-9._%-])+@([A-z0-9.-])+\.([A-z0-9]{2,})/g;
