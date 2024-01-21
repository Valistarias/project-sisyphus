import axios from 'axios';

import Entity from './entity';

interface IGetMailUserPayload {
  userId: string;
  token: string;
}

export default class MailToken extends Entity {
  getMail: (payload: IGetMailUserPayload) => Promise<string>;

  constructor() {
    super('forgot');

    this.getMail = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/getmail/`, { params: payload })
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
