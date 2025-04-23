import type { HydratedIUser, IRole } from '../entities';
import type { InternationalizationType } from './types';

/* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  -- This type is neccessary for global typing
*/
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

export const curateUser = (
  user: HydratedIUser
): Pick<
  HydratedIUser,
  'username' | 'mail' | 'name' | 'lang' | 'theme' | 'scale' | 'charCreationTips' | 'roles' | '_id'
> => {
  const { _id, username, mail, name, lang, theme, scale, charCreationTips, roles } = user;

  return {
    _id,
    username,
    mail,
    name,
    lang,
    theme,
    scale,
    charCreationTips,
    roles,
  };
};

export const checkIfAdminFromRoles = (roles: IRole[]): boolean =>
  roles.find((role) => role.name === 'admin' || role.name === 'super') !== undefined;

export const checkIfSuperFromRoles = (roles: IRole[]): boolean =>
  roles.find((role) => role.name === 'super') !== undefined;

export const getHighestRole = (roles: IRole[]): string => {
  if (checkIfSuperFromRoles(roles)) {
    return 'super';
  }

  if (checkIfAdminFromRoles(roles)) {
    return 'admin';
  }

  return 'user';
};
