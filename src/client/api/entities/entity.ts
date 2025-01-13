import axios from 'axios';

import type { IUser } from '../../types';

type IBasicRequests = (payload: unknown) => Promise<Record<string, unknown>>;

export default class Entity {
  url: string;
  getAll: () => Promise<Record<string, unknown>>;
  create: IBasicRequests;
  update: (payload: unknown) => Promise<IUser>;
  delete: IBasicRequests;
  basicPost: (target: string, payload: unknown) => Promise<Record<string, unknown>>;

  constructor(id: string) {
    this.url = `/api/${id}`;

    this.getAll = async () =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/`)
          .then((res) => {
            resolve(res.data as Record<string, unknown>);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.create = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/create/`, payload)
          .then((res) => {
            resolve(res.data as Record<string, unknown>);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.update = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/update/`, payload)
          .then((res) => {
            resolve(res.data as IUser);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.delete = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/delete/`, payload)
          .then((res) => {
            resolve(res.data as Record<string, unknown>);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.basicPost = async (target, payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/${target}/`, payload)
          .then((res) => {
            resolve(res.data as Record<string, unknown>);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
