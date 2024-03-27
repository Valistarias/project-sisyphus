import axios from 'axios';

import { type IUser } from '../../types';

import Entity from './entity';

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

export default class Auth extends Entity {
  signup: (payload: ISignUpUserPayload) => Promise<boolean>;
  signin: (payload: ISignInUserPayload) => Promise<IUser>;
  signout: () => Promise<boolean>;
  check: () => Promise<IUser>;
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
          .catch((err) => {
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
          .catch((err) => {
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
          .catch((err) => {
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
          .catch((err) => {
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
