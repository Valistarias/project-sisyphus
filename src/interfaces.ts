export interface IUser {
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
