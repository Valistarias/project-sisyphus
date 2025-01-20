import axios from 'axios';

import type { ErrorResponseType } from '../../types/global';

type IBasicRequests<T> = (payload: unknown) => Promise<T>;

export default class Entity<Payload, T, CuratedT> {
  url: string;
  get: (payload: Payload) => Promise<CuratedT>;
  getAll: () => Promise<CuratedT[]>;
  create: IBasicRequests<T>;
  update: (payload: unknown) => Promise<T>;
  delete: IBasicRequests<T>;
  basicPost: (target: string, payload: unknown) => Promise<CuratedT>;

  constructor(id: string) {
    this.url = `/api/${id}`;

    this.getAll = async () =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/`)
          .then((res: { data: CuratedT[] }) => {
            resolve(res.data);
          })
          .catch((err: ErrorResponseType) => {
            reject(err);
          });
      });

    this.get = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res: { data: CuratedT }) => {
            resolve(res.data);
          })
          .catch((err: ErrorResponseType) => {
            reject(err);
          });
      });

    this.create = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/create/`, payload)
          .then((res: { data: T }) => {
            resolve(res.data);
          })
          .catch((err: ErrorResponseType) => {
            reject(err);
          });
      });

    this.update = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/update/`, payload)
          .then((res: { data: T }) => {
            resolve(res.data);
          })
          .catch((err: ErrorResponseType) => {
            reject(err);
          });
      });

    this.delete = async payload =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/delete/`, payload)
          .then((res: { data: T }) => {
            resolve(res.data);
          })
          .catch((err: ErrorResponseType) => {
            reject(err);
          });
      });

    this.basicPost = async (target, payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/${target}/`, payload)
          .then((res: { data: CuratedT }) => {
            resolve(res.data);
          })
          .catch((err: ErrorResponseType) => {
            reject(err);
          });
      });
  }
}
