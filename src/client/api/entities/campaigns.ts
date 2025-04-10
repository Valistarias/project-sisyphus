import axios from 'axios';

import Entity from './entity';

import type { ICampaign, ICard, IDeck } from '../../types';

interface ICampaignPayload {
  campaignId: string;
}

interface ICampaignCodePayload {
  campaignCode: string;
}

export default class Campaigns extends Entity<ICampaignPayload, ICampaign, ICampaign> {
  register: (payload: ICampaignCodePayload) => Promise<{ campaignId: string }>;

  unregister: (payload: ICampaignPayload) => Promise<boolean>;

  find: (payload: ICampaignCodePayload) => Promise<ICampaign>;

  generateCode: (payload: ICampaignPayload) => Promise<ICampaign>;

  shuffleDeck: (payload: ICampaignPayload) => Promise<{ deck: IDeck; discard: IDeck }>;

  wipePlayerHands: (payload: ICampaignPayload) => Promise<boolean>;

  discardCards: (
    payload: ICampaignPayload & { cards: ICard[]; characterId: string }
  ) => Promise<IDeck>;

  getCard: (payload: ICampaignPayload & { cardNumber: number; characterId?: string }) => Promise<{
    drawn: ICard[];
    addedToPlayer: boolean;
  }>;

  constructor() {
    super('campaigns');

    this.register = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/register/`, payload)
          .then((res) => {
            resolve(res.data as { campaignId: string });
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
            resolve(res.data as ICampaign);
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
            resolve(res.data as ICampaign);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.shuffleDeck = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/shuffledeck/`, payload)
          .then((res) => {
            resolve(res.data as ICampaign);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.wipePlayerHands = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/wipeplayercards/`, payload)
          .then((res) => {
            resolve(res.data as boolean);
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.getCard = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/card/`, payload)
          .then((res) => {
            resolve(
              res.data as {
                drawn: ICard[];
                addedToPlayer: boolean;
              }
            );
          })
          .catch((err) => {
            reject(err);
          });
      });

    this.discardCards = async (payload) =>
      await new Promise((resolve, reject) => {
        axios
          .post(`${this.url}/discardcards/`, payload)
          .then((res) => {
            resolve(res.data as IDeck);
          })
          .catch((err) => {
            reject(err);
          });
      });
  }
}
