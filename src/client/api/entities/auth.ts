import axios from 'axios';

import Entity from './entity';

import type {
  IActionDuration,
  IActionType,
  ICuratedAction,
  ICuratedArcane,
  ICuratedArmorType,
  ICuratedBodyPart,
  ICuratedCharParam,
  ICuratedClergy,
  ICuratedCyberFrame,
  ICuratedDamageType,
  ICuratedItemModifier,
  ICuratedProgramScope,
  ICuratedRarity,
  ICuratedRuleBook,
  ICuratedSkill,
  ICuratedStat,
  ICuratedTipText,
  ICuratedWeaponScope,
  ICuratedWeaponStyle,
  ICuratedWeaponType,
  IGlobalValue,
  IItemType,
  IUser,
} from '../../types';
import type { ErrorResponseType } from '../../types/global';

interface ISignInUserPayload {
  mail: string;
  password: string;
}

interface ISignUpUserPayload extends ISignInUserPayload {
  username: string;
}

interface INewPassPayload {
  userId: string;
  token: string;
  pass: string;
  confirmPass: string;
}

interface GlobalResponseObject {
  actionDurations: IActionDuration[];
  actionTypes: IActionType[];
  arcanes: ICuratedArcane[];
  armorTypes: ICuratedArmorType[];
  basicActions: ICuratedAction[];
  bodyParts: ICuratedBodyPart[];
  charParams: ICuratedCharParam[];
  clergies: ICuratedClergy[];
  cyberFrames: ICuratedCyberFrame[];
  damageTypes: ICuratedDamageType[];
  globalValues: IGlobalValue[];
  itemModifiers: ICuratedItemModifier[];
  itemTypes: IItemType[];
  programScopes: ICuratedProgramScope[];
  rarities: ICuratedRarity[];
  ruleBooks: ICuratedRuleBook[];
  skills: ICuratedSkill[];
  stats: ICuratedStat[];
  tipTexts: ICuratedTipText[];
  weaponScopes: ICuratedWeaponScope[];
  weaponStyles: ICuratedWeaponStyle[];
  weaponTypes: ICuratedWeaponType[];
}

export default class Auth extends Entity<unknown, IUser, IUser> {
  signup: (payload: ISignUpUserPayload) => Promise<boolean>;
  signin: (payload: ISignInUserPayload) => Promise<IUser>;
  signout: () => Promise<boolean>;
  check: () => Promise<IUser>;
  getGlobal: () => Promise<GlobalResponseObject>;
  passUpdate: (payload: INewPassPayload) => Promise<IUser>;

  constructor() {
    super('auth');

    this.signup = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/signup/`, {
            mail: payload.mail,
            password: payload.password,
            roles: ['user'],
          })
          .then(() => {
            resolve(true);
          })
          .catch((err: ErrorResponseType) => {
            reject(err);
          });
      });

    this.signin = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/signin/`, {
            mail: payload.mail,
            password: payload.password,
          })
          .then((res) => {
            resolve(res.data as IUser);
          })
          .catch((err: ErrorResponseType) => {
            reject(err);
          });
      });

    this.signout = async () =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/signout/`)
          .then(() => {
            resolve(true);
          })
          .catch((err: ErrorResponseType) => {
            reject(err);
          });
      });

    this.check = async () =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/check/`)
          .then((res) => {
            resolve(res.data as IUser);
          })
          .catch((err: ErrorResponseType) => {
            reject(err);
          });
      });

    this.passUpdate = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/passupdate/`, payload)
          .then((res) => {
            resolve(res.data as IUser);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.getGlobal = async () =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/getglobal/`)
          .then((res) => {
            resolve(res.data as GlobalResponseObject);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }

  // updateUser(payload, cb) {
  //   axios.post(`${this.url}/updateuser/`, payload)
  //     .then((res) => {
  //       // handle success
  //       cb(null, res.data);
  //     })
  //     .catch((err) => {
  //       // handle error
  //       cb(err);
  //     });
  // }
}
