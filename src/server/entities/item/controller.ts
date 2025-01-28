import type {
  Request, Response
} from 'express';
import type { FlattenMaps, HydratedDocument, ObjectId } from 'mongoose';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';
import { type ISentAction, smartUpdateActions } from '../action/controller';
import { curateCharParamBonusIds } from '../charParamBonus/controller';
import { type ISentEffect, smartUpdateEffects } from '../effect/controller';
import { curateSkillBonusIds } from '../skillBonus/controller';
import { curateStatBonusIds } from '../statBonus/controller';

import type { ICuratedActionToSend, ICuratedEffectToSend, InternationalizationType } from '../../utils/types';
import type {
  HydratedIAction,
  HydratedICharParamBonus,
  HydratedIEffect,
  HydratedISkillBonus,
  HydratedIStatBonus
} from '../index';
import type { HydratedIItem, IItem } from './model';

import { curateI18n } from '../../utils';

const { Item } = db;

interface findAllPayload {
  starterKit?: string | Record<string, string[]>
}

const findItems = async (options?: findAllPayload): Promise<HydratedIItem[]> =>
  await new Promise((resolve, reject) => {
    Item.find(options ?? {})
      .populate<{ effects: HydratedIEffect[] }>('effects')
      .populate<{ actions: HydratedIAction[] }>('actions')
      .populate<{ skillBonuses: HydratedISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: HydratedIStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: HydratedICharParamBonus[] }>('charParamBonuses')
      .then((res: HydratedIItem[]) => {
        if (res.length === 0) {
          reject(gemNotFound('Items'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findItemById = async (id: string): Promise<HydratedIItem> =>
  await new Promise((resolve, reject) => {
    Item.findById(id)
      .populate<{ effects: HydratedIEffect[] }>('effects')
      .populate<{ actions: HydratedIAction[] }>('actions')
      .populate<{ skillBonuses: HydratedISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: HydratedIStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: HydratedICharParamBonus[] }>('charParamBonuses')
      .then((res?: HydratedIItem | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Item'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const {
    title,
    summary,
    i18n = null,
    rarity,
    starterKit,
    cost,
    itemType,
    itemModifiers,
    effects,
    actions,
    skillBonuses,
    statBonuses,
    charParamBonuses
  } = req.body;
  if (
    title === undefined
    || summary === undefined
    || rarity === undefined
    || cost === undefined
    || itemType === undefined
  ) {
    res.status(400).send(gemInvalidField('Item'));

    return;
  }

  const item = new Item({
    title,
    summary,
    rarity,
    starterKit,
    cost,
    itemType,
    itemModifiers
  });

  if (i18n !== null) {
    item.i18n = JSON.stringify(i18n);
  }

  curateSkillBonusIds({
    skillBonusesToRemove: [],
    skillBonusesToStay: [],
    skillBonusesToAdd: skillBonuses as Array<{
      skill: string
      value: number
    }>
  })
    .then((skillBonusIds) => {
      if (skillBonusIds.length > 0) {
        item.skillBonuses = skillBonusIds.map(
          skillBonusId => String(skillBonusId)
        );
      }
      curateStatBonusIds({
        statBonusesToRemove: [],
        statBonusesToStay: [],
        statBonusesToAdd: statBonuses as Array<{
          stat: string
          value: number
        }>
      })
        .then((statBonusIds) => {
          if (statBonusIds.length > 0) {
            item.statBonuses = statBonusIds.map(
              statBonusId => String(statBonusId)
            );
          }
          curateCharParamBonusIds({
            charParamBonusesToRemove: [],
            charParamBonusesToStay: [],
            charParamBonusesToAdd: charParamBonuses as Array<{
              charParam: string
              value: number
            }>
          })
            .then((charParamBonusIds) => {
              if (charParamBonusIds.length > 0) {
                item.charParamBonuses = charParamBonusIds.map(
                  charParamBonusId =>
                    String(charParamBonusId)
                );
              }
              smartUpdateEffects({
                effectsToRemove: [],
                effectsToUpdate: effects
              })
                .then((effectsIds) => {
                  if (effectsIds.length > 0) {
                    item.effects = effectsIds.map(
                      effectsId => String(effectsId)
                    );
                  }
                  smartUpdateActions({
                    actionsToRemove: [],
                    actionsToUpdate: actions
                  })
                    .then((actionsIds) => {
                      if (actionsIds.length > 0) {
                        item.actions = actionsIds.map(
                          actionsId => String(actionsId)
                        );
                      }
                      item
                        .save()
                        .then(() => {
                          res.send(item);
                        })
                        .catch((err: unknown) => {
                          res.status(500).send(gemServerError(err));
                        });
                    })
                    .catch((err: unknown) => {
                      res.status(500).send(gemServerError(err));
                    });
                })
                .catch((err: unknown) => {
                  res.status(500).send(gemServerError(err));
                });
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id,
    title = null,
    summary = null,
    i18n,
    rarity,
    starterKit = null,
    cost,
    itemType,
    itemModifiers = null,
    effects = null,
    actions = null,
    skillBonuses = null,
    statBonuses = null,
    charParamBonuses = null
  }: {
    id?: string
    title: string | null
    summary: string | null
    i18n: InternationalizationType | null
    rarity: ObjectId | null
    starterKit: 'always' | 'never' | 'option' | null
    cost: number | null
    itemType: ObjectId | null
    itemModifiers: ObjectId[] | null
    effects: ISentEffect[] | null
    actions: ISentAction[] | null
    skillBonuses: Array<{
      skill: string
      value: number
    }> | null
    statBonuses: Array<{
      stat: string
      value: number
    }> | null
    charParamBonuses: Array<{
      charParam: string
      value: number
    }> | null
    overrides: ObjectId[] | null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Item ID'));

    return;
  }

  findItemById(id)
    .then((item) => {
      if (title !== null) {
        item.title = title;
      }
      if (rarity !== null) {
        item.rarity = rarity;
      }
      if (starterKit !== null) {
        item.starterKit = starterKit;
      }
      if (summary !== null) {
        item.summary = summary;
      }
      if (cost !== null) {
        item.cost = cost;
      }
      if (itemType !== null) {
        item.itemType = itemType;
      }
      if (itemModifiers !== null) {
        item.itemModifiers = itemModifiers;
      }

      const skillBonusesToStay: string[] = [];
      let skillBonusesToRemove: string[] = [];
      let skillBonusesToAdd: Array<{
        skill: string
        value: number
      }> = [];

      if (skillBonuses !== null) {
        skillBonusesToRemove = item.skillBonuses.reduce(
          (result: string[], elt: HydratedISkillBonus) => {
            const foundSkillBonus = skillBonuses.find(
              skillBonus => skillBonus.skill === String(elt.skill)
                && skillBonus.value === elt.value
            );
            if (foundSkillBonus === undefined) {
              result.push(String(elt._id));
            } else {
              skillBonusesToStay.push(String(elt._id));
            }

            return result;
          },
          []
        );

        skillBonusesToAdd = skillBonuses.reduce(
          (
            result: Array<{
              skill: string
              value: number
            }>,
            elt: {
              skill: string
              value: number
            }
          ) => {
            const foundSkillBonus = item.skillBonuses.find(
              skillBonus =>
                typeof skillBonus !== 'string'
                && String(skillBonus.skill) === elt.skill
                && skillBonus.value === elt.value
            );
            if (foundSkillBonus === undefined) {
              result.push(elt);
            }

            return result;
          },
          []
        );
      }

      const statBonusesToStay: string[] = [];
      let statBonusesToRemove: string[] = [];
      let statBonusesToAdd: Array<{
        stat: string
        value: number
      }> = [];

      if (statBonuses !== null) {
        statBonusesToRemove = item.statBonuses.reduce(
          (result: string[], elt: HydratedIStatBonus) => {
            const foundStatBonus = statBonuses.find(
              statBonus => statBonus.stat === String(elt.stat)
                && statBonus.value === elt.value
            );
            if (foundStatBonus === undefined) {
              result.push(String(elt._id));
            } else {
              statBonusesToStay.push(String(elt._id));
            }

            return result;
          },
          []
        );

        statBonusesToAdd = statBonuses.reduce(
          (
            result: Array<{
              stat: string
              value: number
            }>,
            elt: {
              stat: string
              value: number
            }
          ) => {
            const foundStatBonus = item.statBonuses.find(
              statBonus =>
                typeof statBonus !== 'string'
                && String(statBonus.stat) === elt.stat
                && statBonus.value === elt.value
            );
            if (foundStatBonus === undefined) {
              result.push(elt);
            }

            return result;
          },
          []
        );
      }

      const charParamBonusesToStay: string[] = [];
      let charParamBonusesToRemove: string[] = [];
      let charParamBonusesToAdd: Array<{
        charParam: string
        value: number
      }> = [];
      if (charParamBonuses !== null) {
        charParamBonusesToRemove = item.charParamBonuses.reduce(
          (result: string[], elt: HydratedICharParamBonus) => {
            const foundCharParamBonus = charParamBonuses.find(
              charParamBonus =>
                charParamBonus.charParam === String(elt.charParam)
                && charParamBonus.value === elt.value
            );
            if (foundCharParamBonus === undefined) {
              result.push(String(elt._id));
            } else {
              charParamBonusesToStay.push(String(elt._id));
            }

            return result;
          },
          []
        );

        charParamBonusesToAdd = charParamBonuses.reduce(
          (
            result: Array<{
              charParam: string
              value: number
            }>,
            elt: {
              charParam: string
              value: number
            }
          ) => {
            const foundCharParamBonus = item.charParamBonuses.find(
              charParamBonus =>
                typeof charParamBonus !== 'string'
                && String(charParamBonus.charParam) === elt.charParam
                && charParamBonus.value === elt.value
            );
            if (foundCharParamBonus === undefined) {
              result.push(elt);
            }

            return result;
          },
          []
        );
      }

      let effectsToRemove: string[] = [];

      if (effects !== null) {
        effectsToRemove = item.effects.reduce(
          (result: string[], elt: HydratedIEffect) => {
            const foundEffect = effects.find(
              effect => effect.id !== undefined
                && String(effect.id) === String(elt._id)
            );
            if (foundEffect === undefined) {
              result.push(String(elt._id));
            }

            return result;
          }, []
        );
      }

      let actionsToRemove: string[] = [];

      if (actions !== null) {
        actionsToRemove = item.actions.reduce(
          (result: string[], elt: HydratedIAction) => {
            const foundAction = actions.find(
              action => action.id !== undefined
                && String(action.id) === String(elt._id)
            );
            if (foundAction === undefined) {
              result.push(String(elt._id));
            }

            return result;
          }, []
        );
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = { ...(
          item.i18n !== undefined
          && item.i18n !== ''
            ? JSON.parse(item.i18n)
            : {}
        ) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        item.i18n = JSON.stringify(newIntl);
      }

      curateSkillBonusIds({
        skillBonusesToRemove,
        skillBonusesToAdd,
        skillBonusesToStay
      })
        .then((skillBonusIds) => {
          if (skillBonusIds.length > 0) {
            item.skillBonuses = skillBonusIds.map(
              skillBonusId => String(skillBonusId)
            );
          } else if (skillBonuses !== null && skillBonuses.length === 0) {
            item.skillBonuses = [];
          }
          curateStatBonusIds({
            statBonusesToRemove,
            statBonusesToAdd,
            statBonusesToStay
          })
            .then((statBonusIds) => {
              if (statBonusIds.length > 0) {
                item.statBonuses = statBonusIds.map(
                  statBonusId => String(statBonusId)
                );
              }
              curateCharParamBonusIds({
                charParamBonusesToRemove,
                charParamBonusesToAdd,
                charParamBonusesToStay
              })
                .then((charParamBonusIds) => {
                  if (charParamBonusIds.length > 0) {
                    item.charParamBonuses = charParamBonusIds.map(
                      charParamBonusId =>
                        String(charParamBonusId)
                    );
                  }
                  smartUpdateEffects({
                    effectsToRemove,
                    effectsToUpdate: effects ?? []
                  })
                    .then((effectsIds) => {
                      if (effectsIds.length > 0) {
                        item.effects = effectsIds.map(
                          effectsId => String(effectsId)
                        );
                      }
                      smartUpdateActions({
                        actionsToRemove,
                        actionsToUpdate: actions ?? []
                      })
                        .then((actionsIds) => {
                          if (actionsIds.length > 0) {
                            item.actions = actionsIds.map(
                              actionsId => String(actionsId)
                            );
                          }
                          item
                            .save()
                            .then(() => {
                              res.send({
                                message: 'Item was updated successfully!', item
                              });
                            })
                            .catch((err: unknown) => {
                              res.status(500).send(gemServerError(err));
                            });
                        })
                        .catch((err: unknown) => {
                          res.status(500).send(gemServerError(err));
                        });
                    })
                    .catch((err: unknown) => {
                      res.status(500).send(gemServerError(err));
                    });
                })
                .catch((err: unknown) => {
                  res.status(500).send(gemServerError(err));
                });
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Item'));
    });
};

const deleteItemById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Item ID'));

      return;
    }
    Item.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteItem = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;

  findItemById(id)
    .then((item: HydratedDocument<
      Omit<IItem, | 'effects'
      | 'actions'
      | 'skillBonuses'
      | 'statBonuses'
      | 'charParamBonuses'
      > & {
        effects: HydratedIEffect[]
        actions: HydratedIAction[]
        skillBonuses: HydratedISkillBonus[]
        statBonuses: HydratedIStatBonus[]
        charParamBonuses: HydratedICharParamBonus[]
      }
    >) => {
      const skillBonusesToRemove = item.skillBonuses.map(
        elt => String(elt._id)
      );
      const statBonusesToRemove = item.statBonuses.map(elt => String(elt._id));
      const charParamBonusesToRemove = item.charParamBonuses.map(
        elt => String(elt._id)
      );
      const effectsToRemove = item.effects.map(elt => String(elt._id));
      const actionsToRemove = item.actions.map(elt => String(elt._id));

      curateSkillBonusIds({
        skillBonusesToRemove,
        skillBonusesToAdd: [],
        skillBonusesToStay: []
      })
        .then(() => {
          curateStatBonusIds({
            statBonusesToRemove,
            statBonusesToAdd: [],
            statBonusesToStay: []
          })
            .then(() => {
              curateCharParamBonusIds({
                charParamBonusesToRemove,
                charParamBonusesToAdd: [],
                charParamBonusesToStay: []
              })
                .then(() => {
                  smartUpdateEffects({
                    effectsToRemove,
                    effectsToUpdate: []
                  })
                    .then(() => {
                      smartUpdateActions({
                        actionsToRemove,
                        actionsToUpdate: []
                      })
                        .then(() => {
                          deleteItemById(id)
                            .then(() => {
                              res.send({ message: 'Item was deleted successfully!' });
                            })
                            .catch((err: unknown) => {
                              res.status(500).send(gemServerError(err));
                            });
                        })
                        .catch((err: unknown) => {
                          res.status(500).send(gemServerError(err));
                        });
                    })
                    .catch((err: unknown) => {
                      res.status(500).send(gemServerError(err));
                    });
                })
                .catch((err: unknown) => {
                  res.status(500).send(gemServerError(err));
                });
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Item'));
    });
};

export type IItemSent = HydratedDocument<
  Omit<
    IItem,
    | 'effects'
    | 'actions'
  > & {
    effects: HydratedIEffect[]
    actions: HydratedIAction[]
    skillBonuses: HydratedISkillBonus[]
    statBonuses: HydratedIStatBonus[]
    charParamBonuses: HydratedICharParamBonus[]
  }
>;

export interface CuratedIItemToSend {
  item: Omit<
    FlattenMaps<IItem>,
    | 'effects'
    | 'actions'
  > & {
    effects: Array<{
      effect: ICuratedEffectToSend
      i18n?: InternationalizationType
    }>
    actions: Array<{
      action: ICuratedActionToSend
      i18n?: InternationalizationType
    }>
  }
  i18n?: InternationalizationType
}

export const curateSingleItem = (itemSent: IItemSent): CuratedIItemToSend => {
  const curatedActions
  = itemSent.actions.length > 0
    ? itemSent.actions.map((action) => {
        const data = action.toJSON();

        return {
          action: data,
          i18n: curateI18n(data.i18n)
        };
      })
    : [];
  const curatedEffects
  = itemSent.effects.length > 0
    ? itemSent.effects.map((effect) => {
        const data = effect.toJSON();

        return {
          effect: data,
          i18n: curateI18n(data.i18n)
        };
      })
    : [];

  return {
    item: {
      ...itemSent.toJSON(),
      actions: curatedActions,
      effects: curatedEffects
    },
    i18n: curateI18n(itemSent.i18n)
  };
};

const findSingle = (req: Request, res: Response): void => {
  const { itemId } = req.query;
  if (itemId === undefined || typeof itemId !== 'string') {
    res.status(400).send(gemInvalidField('Item ID'));

    return;
  }
  findItemById(itemId)
    .then((itemSent: IItemSent) => {
      res.send(curateSingleItem(itemSent));
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findItems()
    .then((items: IItemSent[]) => {
      const curatedItems: CuratedIItemToSend[] = [];
      items.forEach((itemSent) => {
        curatedItems.push(curateSingleItem(itemSent));
      });

      res.send(curatedItems);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAllStarter = (req: Request, res: Response): void => {
  findItems({ starterKit: { $in: ['always', 'option'] } })
    .then((items: IItemSent[]) => {
      const curatedItems: CuratedIItemToSend[] = [];
      items.forEach((itemSent) => {
        curatedItems.push(curateSingleItem(itemSent));
      });

      res.send(curatedItems);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create, deleteItem, findAll, findAllStarter, findItemById, findSingle, update
};
