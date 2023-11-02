import Entity from './entity';
import axios from 'axios';

interface IUpdateUserPayload {
  username: string;
  password: string;
  name: string;
  lang: string;
  theme: string;
  scale: number;
}

export default class Users extends Entity {
  update: (payload: IUpdateUserPayload) => Promise<Record<string, string>>;

  constructor() {
    super('users');

    this.update = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/update/`, payload)
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
