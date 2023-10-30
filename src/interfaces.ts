export interface IUser {
  /** The ID of the user */
  _id: string
  /** The mail of the user */
  mail: string
  /** The user password (encrypted) */
  password: string
  /** The name of the user */
  name: string
  /** The chosen language for the UI */
  lang: string
  /** The chosen theme for the UI */
  theme: string
  /** The scale of the UI */
  scale: number
  /** Is the user verified */
  verified: boolean
  /** The user roles */
  roles: Array<{
    _id: string
    name: string
  }>
}

export interface IRuleBook {
  /** The ID of the rulebook */
  _id: string
  /** The title of the rulebook */
  title: string
  /** The type of the rulebook */
  type: {
    _id: string
    name: string
  }
  /** The summary of the rulebook */
  summary: string
  /** When the rulebook was created */
  createdAt: string
}

export interface ICuratedRuleBook {
  i18n: Record<string, any> | null
  ruleBook: IRuleBook
}

export interface IRuleBookType {
  /** The ID of the rulebook type */
  _id: string
  /** The name of the rulebook type */
  name: string
}
