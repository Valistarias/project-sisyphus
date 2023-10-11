import axios from 'axios';
import Entity from './entity';

interface ISignUserPayload {
  mail: string
  password: string
};;

export default class Auth extends Entity {
  signup: (payload: ISignUserPayload) => Promise<Record<string, string>>;
  signin: (payload: ISignUserPayload) => Promise<Record<string, string>>;
  signout: () => Promise<Record<string, string>>;

  constructor () {
    super('auth');

    this.signup = async (payload) => await new Promise((resolve, reject) => {
      axios.post(`${this.url}/signup/`, {
        mail: payload.mail,
        password: payload.password,
        roles: ['user']
      })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });

    this.signin = async (payload) => await new Promise((resolve, reject) => {
      axios.post(`${this.url}/signin/`, {
        mail: payload.mail,
        password: payload.password
      })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });

    this.signout = async () => await new Promise((resolve, reject) => {
      axios.post(`${this.url}/signout/`)
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

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
