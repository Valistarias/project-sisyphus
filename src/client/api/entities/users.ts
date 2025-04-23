import axios from 'axios';

import Entity from './entity';

import type { IUser } from '../../types';

interface IUserPayload {
  userId: string;
}

// interface IUpdateUserPayload {
//   username: string;
//   password: string;
//   name: string;
//   lang: string;
//   theme: string;
//   scale: number;
// }

export default class Users extends Entity<unknown, IUser, IUser> {
  promote: (payload: IUserPayload) => Promise<IUser>;
  demote: (payload: IUserPayload) => Promise<IUser>;

  constructor() {
    super('users');

    this.promote = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/promote/`, payload)
          .then((res) => {
            resolve(res.data as IUser);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.demote = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/demote/`, payload)
          .then((res) => {
            resolve(res.data as IUser);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
