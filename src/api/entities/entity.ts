import axios from 'axios';

type IBasicRequests = (payload: any) => Promise<Record<string, string>>;

export default class Entity {
  url: string;
  getAll: () => Promise<Record<string, any>>;
  create: IBasicRequests;
  update: IBasicRequests;
  delete: IBasicRequests;
  basicPost: (target: string, payload: any) => Promise<Record<string, string>>;

  constructor (id: string) {
    this.url = `/api/${id}`;

    this.getAll = async () => await new Promise((resolve, reject) => {
      axios.get(`${this.url}/`)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });

    this.create = async (payload) => await new Promise((resolve, reject) => {
      axios.post(`${this.url}/create/`, payload)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });

    this.update = async (payload) => await new Promise((resolve, reject) => {
      axios.post(`${this.url}/update/`, payload)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });

    this.delete = async (payload) => await new Promise((resolve, reject) => {
      axios.post(`${this.url}/delete/`, payload)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });

    this.basicPost = async (target, payload) => await new Promise((resolve, reject) => {
      axios.post(`${this.url}/${target}/`, payload)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
