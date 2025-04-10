import type { Request, Response } from 'express';
import type { HydratedDocument, ObjectId } from 'mongoose';

import { v4 as uuidv4 } from 'uuid';

import { getUserFromToken, type IVerifyTokenRequest } from '../../middlewares/authJwt';
import { Deck, type ICard } from '../../middlewares/deck';
import db from '../../models';
import {
  gemInvalidField,
  gemNotFound,
  gemServerError,
  gemUnauthorized,
} from '../../utils/globalErrorMessage';
import { findLeanArcanes } from '../arcane/controller';
import { deleteCampaignEventByCampaignId } from '../campaignEvent/controller';
import { findCharacterById, wipeCharactersHandsByCampaignId } from '../character/controller';
import { findGlobalValues } from '../globalValue/controller';

import type { Lean } from '../../utils/types';
import type { ICharacter } from '../character';
import type {
  HydratedICompleteCampaign,
  HydratedISimpleCampaign,
  LeanICompleteCampaign,
} from './model';
import type { IUser } from '../user/model';

const { Campaign } = db;

const findCampaigns = async (req: Request): Promise<HydratedICompleteCampaign[]> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));

          return;
        }
        Campaign.find()
          .or([{ owner: user._id }, { players: user._id }])
          .populate<{ owner: HydratedDocument<IUser> }>('owner')
          .populate<{ players: Array<HydratedDocument<IUser>> }>('players')
          .populate<{ characters: Array<ICharacter<string>> }>({
            path: 'characters',
            select: '_id name campaign',
          })
          .then((res: HydratedICompleteCampaign[]) => {
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findCampaignById = async (
  id: string,
  req: Request
): Promise<{
  campaign: HydratedICompleteCampaign;
  isOwner: boolean;
  isPlayer: boolean;
}> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));

          return;
        }
        Campaign.findById(id)
          .or([{ owner: user._id }, { players: user._id }])
          .populate<{ owner: HydratedDocument<IUser> }>('owner')
          .populate<{ players: Array<HydratedDocument<IUser>> }>('players')
          .populate<{ characters: Array<ICharacter<string>> }>({
            path: 'characters',
            select: '_id name campaign',
          })
          .then((res?: HydratedICompleteCampaign | null) => {
            if (res === undefined || res === null) {
              reject(gemNotFound('Campaign'));
            } else {
              resolve({
                campaign: res,
                isOwner: String(res.owner._id) === String(user._id),
                isPlayer:
                  res.players.find((player) => String(player._id) === String(user._id)) !==
                  undefined,
              });
            }
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findCompleteCampaignById = async (
  id: string,
  req: Request
): Promise<{
  campaign: LeanICompleteCampaign;
  isOwner: boolean;
}> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));

          return;
        }
        Campaign.findById(id)
          .or([{ owner: user._id }, { players: user._id }])
          .lean()
          .populate<{ owner: Lean<IUser> }>('owner')
          .populate<{ players: Array<Lean<IUser>> }>('players')
          .populate<{ characters: Array<Lean<ICharacter<string>>> }>({
            path: 'characters',
            select: '_id name campaign',
          })
          .then((res?: LeanICompleteCampaign | null) => {
            if (res === undefined || res === null) {
              reject(gemNotFound('Campaign'));
            } else {
              resolve({
                campaign: res,
                isOwner: String(res.owner._id) === String(user._id),
              });
            }
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const findCampaignByCode = async (id: string, req: Request): Promise<HydratedISimpleCampaign> =>
  await new Promise((resolve, reject) => {
    getUserFromToken(req as IVerifyTokenRequest)
      .then((user) => {
        if (user === null) {
          reject(gemNotFound('User'));

          return;
        }
        Campaign.find({ code: id })
          .populate<{ owner: HydratedDocument<IUser> }>('owner')
          .then((res?: HydratedISimpleCampaign[] | null) => {
            if (res === undefined || res === null) {
              reject(gemNotFound('Campaign'));
            } else {
              resolve(res[0]);
            }
          })
          .catch((err) => {
            reject(err);
          });
      })
      .catch((err) => {
        reject(gemServerError(err));
      });
  });

const create = (req: Request, res: Response): void => {
  const { name } = req.body;
  if (name === undefined) {
    res.status(400).send(gemInvalidField('Campaign'));

    return;
  }
  getUserFromToken(req as IVerifyTokenRequest)
    .then((user) => {
      if (user === null) {
        res.status(404).send(gemNotFound('User'));

        return;
      }
      const campaign = new Campaign({
        name,
        owner: user._id,
        code: uuidv4(),
      });

      campaign
        .save()
        .then(() => {
          res.send(campaign);
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const update = (req: Request, res: Response): void => {
  const { id, name = null } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Campaign ID'));

    return;
  }
  findCampaignById(id as string, req)
    .then(({ campaign, isOwner }) => {
      if (!isOwner) {
        res.status(400).send(gemInvalidField('User ID'));

        return;
      }
      if (name !== null && name !== campaign.name) {
        campaign.name = name;
      }
      campaign
        .save()
        .then(() => {
          res.send({
            message: 'Campaign was updated successfully!',
            campaign,
          });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const generateCode = (req: Request, res: Response): void => {
  const { campaignId } = req.body;
  if (campaignId === undefined) {
    res.status(400).send(gemInvalidField('Campaign ID'));

    return;
  }
  findCampaignById(campaignId as string, req)
    .then(({ campaign, isOwner }) => {
      if (isOwner) {
        campaign.code = uuidv4();
        campaign
          .save()
          .then(() => {
            res.send({
              message: 'Campaign code was changed successfully!',
              campaign,
            });
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemUnauthorized());
      }
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const register = (req: Request, res: Response): void => {
  const { campaignCode } = req.body;
  if (campaignCode === undefined) {
    res.status(400).send(gemInvalidField('Campaign Code'));

    return;
  }

  interface ICampaignPayload extends Omit<HydratedISimpleCampaign, 'players'> {
    players: string[] | ObjectId[];
  }

  getUserFromToken(req as IVerifyTokenRequest)
    .then((user) => {
      findCampaignByCode(campaignCode as string, req)
        .then((campaign: ICampaignPayload) => {
          const foundPlayer =
            user !== null
              ? Boolean(campaign.players.find((player) => String(player) === String(user._id)))
              : false;
          if (user !== null && !foundPlayer) {
            const newArray = campaign.players.map((player) => String(player));
            newArray.push(String(user._id));
            campaign.players = newArray;
            campaign
              .save()
              .then(() => {
                res.send({
                  message: 'Campaign was updated successfully!',
                  campaignId: campaign._id,
                });
              })
              .catch((err: unknown) => {
                res.status(500).send(gemServerError(err));
              });
          } else {
            res.status(404).send(gemNotFound('Campaign'));
          }
        })
        .catch((err: unknown) => res.status(500).send(gemServerError(err)));
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const unregister = (req: Request, res: Response): void => {
  const { campaignId } = req.body;
  if (campaignId === undefined) {
    res.status(400).send(gemInvalidField('Campaign Id'));

    return;
  }

  interface ICampaignPayload extends Omit<HydratedICompleteCampaign, 'players'> {
    players: string[] | IUser[];
  }

  getUserFromToken(req as IVerifyTokenRequest)
    .then((user) => {
      findCampaignById(campaignId as string, req)
        .then(({ campaign }: { campaign: ICampaignPayload }) => {
          const foundPlayer =
            user !== null
              ? Boolean(campaign.players.find((player) => String(player) === String(user._id)))
              : false;
          if (user !== null && foundPlayer) {
            const newArray: string[] = [];
            campaign.players.forEach((player) => {
              const playerStr = String(player);
              if (playerStr !== String(user._id)) {
                newArray.push(playerStr);
              }
            });
            campaign.players = newArray;
            campaign
              .save()
              .then(() => {
                res.send({ message: 'Campaign was updated successfully!' });
              })
              .catch((err: unknown) => {
                res.status(500).send(gemServerError(err));
              });
          } else {
            res.status(404).send(gemNotFound('Campaign'));
          }
        })
        .catch((err: unknown) => res.status(500).send(gemServerError(err)));
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const deleteCampaign = (req: Request, res: Response): void => {
  const { id }: { id?: string } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Campaign ID'));

    return;
  }
  deleteCampaignEventByCampaignId(id)
    .then(() => {
      Campaign.findByIdAndDelete(id)
        .then(() => {
          res.send({ message: 'Campaign was deleted successfully!' });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const shuffleDeck = (req: Request, res: Response): void => {
  const { campaignId }: { campaignId?: string } = req.body;
  if (campaignId === undefined) {
    res.status(400).send(gemInvalidField('Campaign ID'));

    return;
  }
  findCampaignById(campaignId, req)
    .then(({ campaign, isOwner }) => {
      if (isOwner) {
        findLeanArcanes()
          .then((arcanes) => {
            const deck = new Deck(undefined, arcanes);
            deck.shuffle();
            campaign.deck = deck.deckToString;
            campaign.discard = '';
            campaign
              .save()
              .then(() => {
                res.send({ deck: deck.deck, discard: '' });
              })
              .catch((err: unknown) => {
                res.status(500).send(gemServerError(err));
              });
          })
          .catch(() => {
            res.status(404).send(gemNotFound('Arcanes'));
          });
      } else {
        res.status(404).send(gemUnauthorized());
      }
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const getCardFromDeck = (req: Request, res: Response): void => {
  const {
    campaignId,
    cardNumber,
    characterId,
  }: {
    campaignId?: string;
    characterId?: string;
    cardNumber?: number;
  } = req.body;
  if (campaignId === undefined || cardNumber === undefined) {
    res.status(400).send(gemInvalidField('Campaign ID'));

    return;
  }
  findCampaignById(campaignId, req)
    .then(({ campaign, isOwner, isPlayer }) => {
      if (isOwner || isPlayer) {
        const deck = new Deck({ deck: campaign.deck ?? '', discard: campaign.discard ?? '' });
        const firstCards = deck.draw(cardNumber);
        if (characterId !== undefined) {
          findCharacterById(characterId, req)
            .then(({ char, canEdit }) => {
              if (canEdit) {
                const hand = new Deck({ deck: char.hand ?? '', discard: '' });
                findGlobalValues()
                  .then((globalValues) => {
                    campaign.deck = deck.deckToString;
                    campaign.discard = deck.discardToString;
                    campaign
                      .save()
                      .then(() => {
                        const globalValueHandSize = globalValues.find(
                          (globalValue) => globalValue.name === 'nbCardInHand'
                        )?.value;
                        const handSizeValue = Number(globalValueHandSize ?? 3);

                        if (globalValueHandSize === undefined) {
                          console.error('Attention: Applying default hand size: 3');
                        }

                        if (hand.deck.length + cardNumber <= handSizeValue) {
                          hand.addCards(firstCards);

                          char.hand = hand.deckToString;
                          char
                            .save()
                            .then(() => {
                              res.send({
                                drawn: firstCards,
                                addedToPlayer: true,
                              });
                            })
                            .catch((err: unknown) => {
                              res.status(500).send(gemServerError(err));
                            });
                        } else {
                          res.send({
                            drawn: firstCards,
                            addedToPlayer: false,
                          });
                        }
                      })
                      .catch((err: unknown) => {
                        res.status(500).send(gemServerError(err));
                      });
                  })
                  .catch((err: unknown) => res.status(500).send(gemServerError(err)));
              } else {
                res.send({
                  drawn: firstCards,
                  addedToPlayer: false,
                });
              }
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        } else {
          res.send({
            drawn: firstCards,
            addedToPlayer: false,
          });
        }
      } else {
        res.status(404).send(gemNotFound('Campaign'));
      }
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const discardCardsFromPlayer = (req: Request, res: Response): void => {
  const {
    campaignId,
    cards,
    characterId,
  }: {
    campaignId?: string;
    characterId?: string;
    cards: ICard[];
  } = req.body;
  if (campaignId === undefined || characterId === undefined || cards.length === 0) {
    res.status(400).send(gemInvalidField('Campaign ID'));

    return;
  }
  findCampaignById(campaignId, req)
    .then(({ campaign, isOwner, isPlayer }) => {
      if (isOwner || isPlayer) {
        const campaignDeck = new Deck({
          deck: campaign.deck ?? '',
          discard: campaign.discard ?? '',
        });

        findCharacterById(characterId, req)
          .then(({ char, canEdit }) => {
            if (canEdit) {
              const hand = new Deck({ deck: char.hand ?? '', discard: '' });
              hand.removeCards(cards);
              campaignDeck.addCardsToDiscard(cards);

              campaign.deck = campaignDeck.deckToString;
              campaign.discard = campaignDeck.discardToString;
              campaign
                .save()
                .then(() => {
                  char.hand = hand.deckToString;
                  char
                    .save()
                    .then(() => {
                      res.send(hand.deck);
                    })
                    .catch((err: unknown) => {
                      res.status(500).send(gemServerError(err));
                    });
                })
                .catch((err: unknown) => {
                  res.status(500).send(gemServerError(err));
                });
            } else {
              res.status(404).send(gemUnauthorized());
            }
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      } else {
        res.status(404).send(gemNotFound('Campaign'));
      }
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const wipePlayerCards = (req: Request, res: Response): void => {
  const { campaignId }: { campaignId?: string } = req.body;
  if (campaignId === undefined) {
    res.status(400).send(gemInvalidField('Campaign ID'));

    return;
  }
  findCompleteCampaignById(campaignId, req)
    .then(({ isOwner }) => {
      if (isOwner) {
        wipeCharactersHandsByCampaignId(campaignId)
          .then(() => {
            res.send(true);
          })
          .catch((err) => res.status(404).send(err));
      } else {
        res.status(404).send(gemUnauthorized());
      }
    })
    .catch((err) => res.status(404).send(err));
};

const findSingle = (req: Request, res: Response): void => {
  const { campaignId } = req.query;
  if (campaignId === undefined || typeof campaignId !== 'string') {
    res.status(400).send(gemInvalidField('Campaign ID'));

    return;
  }
  findCompleteCampaignById(campaignId, req)
    .then(({ campaign, isOwner }) => {
      const deck = new Deck({ deck: campaign.deck ?? '', discard: campaign.discard ?? '' });
      deck.hideIfUser(isOwner);

      res.send({
        ...campaign,
        deck: deck.deck,
        discard: deck.discard,
      });
    })
    .catch((err) => res.status(404).send(err));
};

const findByCode = (req: Request, res: Response): void => {
  const { campaignCode } = req.query;
  if (campaignCode === undefined || typeof campaignCode !== 'string') {
    res.status(400).send(gemInvalidField('Campaign Code'));

    return;
  }
  findCampaignByCode(campaignCode, req)
    .then((campaign) => res.send(campaign))
    .catch((err) => res.status(404).send(err));
};

const findAll = (req: Request, res: Response): void => {
  findCampaigns(req)
    .then((campaigns) => res.send(campaigns))
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  deleteCampaign,
  findAll,
  findByCode,
  findSingle,
  generateCode,
  register,
  unregister,
  update,
  shuffleDeck,
  getCardFromDeck,
  discardCardsFromPlayer,
  wipePlayerCards,
};
