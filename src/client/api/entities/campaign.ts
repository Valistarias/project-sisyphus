import axios from 'axios';

import Entity from './entity';

import { type ICampaign } from '../../types/data';

interface ICampaignPayload {
  campaignId: string;
}

interface ICampaignCodePayload {
  campaignCode: string;
}

export default class Campaigns extends Entity {
  get: (payload: ICampaignPayload) => Promise<ICampaign>;
  register: (payload: ICampaignCodePayload) => Promise<{ campaignId: string }>;
  unregister: (payload: ICampaignPayload) => Promise<boolean>;
  find: (payload: ICampaignCodePayload) => Promise<ICampaign>;
  generateCode: (payload: ICampaignPayload) => Promise<ICampaign>;

  constructor() {
    super('campaigns');

    this.get = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/single/`, { params: payload })
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.register = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/register/`, payload)
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.unregister = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/unregister/`, payload)
          .then((res) => {
            resolve(Boolean(res));
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.find = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .get(`${this.url}/find/`, { params: payload })
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.generateCode = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/generatecode/`, payload)
          .then((res) => {
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
