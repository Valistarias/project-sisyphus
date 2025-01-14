import axios from 'axios';

type IBasicRequests<T> = (payload: unknown) => Promise<T>;

export default class Entity<T> {
  url: string;
  getAll: () => Promise<T[]>;
  create: IBasicRequests<T>;
  update: (payload: unknown) => Promise<T>;
  delete: IBasicRequests<T>;
  basicPost: (target: string, payload: unknown) => Promise<T>;

  constructor(id: string) {
    this.url = `/api/${id}`;

    this.getAll = async () =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/`)
          .then((res: { data: T[] }) => {
            resolve(res.data);
          })
          .catch((err: unknown) => {
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
          .catch((err: unknown) => {
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
          .catch((err: unknown) => {
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
          .catch((err: unknown) => {
            reject(err);
          });
      });

    this.basicPost = async (target, payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/${target}/`, payload)
          .then((res: { data: T }) => {
            resolve(res.data);
          })
          .catch((err: unknown) => {
            reject(err);
          });
      });
  }
}
