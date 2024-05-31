import { type Request, type Response } from 'express';
import { type ObjectId } from 'mongoose';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { smartUpdateActions } from '../action/controller';
import { curateCharParamBonusIds } from '../charParamBonus/controller';
import { smartUpdateEffects } from '../effect/controller';
import {
  type IAction,
  type ICharParamBonus,
  type IEffect,
  type ISkillBonus,
  type IStatBonus,
} from '../index';
import { curateSkillBonusIds } from '../skillBonus/controller';
import { curateStatBonusIds } from '../statBonus/controller';

import { type HydratedIItem } from './model';

import { curateI18n } from '../../utils';

const { Item } = db;

interface findAllPayload {
  starterKit?: string | Record<string, string[]>;
}

const findItems = async (options?: findAllPayload): Promise<HydratedIItem[]> =>
  await new Promise((resolve, reject) => {
    Item.find(options ?? {})
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: IAction[] }>('actions')
      .populate<{ skillBonuses: ISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: IStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: ICharParamBonus[] }>('charParamBonuses')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Items'));
        } else {
          resolve(res as HydratedIItem[]);
        }
      })
      .catch(async (err: Error) => {
        reject(err);
      });
  });

const findItemById = async (id: string): Promise<HydratedIItem> =>
  await new Promise((resolve, reject) => {
    Item.findById(id)
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: IAction[] }>('actions')
      .populate<{ skillBonuses: ISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: IStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: ICharParamBonus[] }>('charParamBonuses')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Item'));
        } else {
          resolve(res as HydratedIItem);
        }
      })
      .catch(async (err: Error) => {
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
    charParamBonuses,
  } = req.body;
  if (
    title === undefined ||
    summary === undefined ||
    rarity === undefined ||
    cost === undefined ||
    itemType === undefined
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
    itemModifiers,
  });

  if (i18n !== null) {
    item.i18n = JSON.stringify(i18n);
  }

  curateSkillBonusIds({
    skillBonusesToRemove: [],
    skillBonusesToStay: [],
    skillBonusesToAdd: skillBonuses as Array<{
      skill: string;
      value: number;
    }>,
  })
    .then((skillBonusIds) => {
      if (skillBonusIds.length > 0) {
        item.skillBonuses = skillBonusIds.map((skillBonusId) => String(skillBonusId));
      }
      curateStatBonusIds({
        statBonusesToRemove: [],
        statBonusesToStay: [],
        statBonusesToAdd: statBonuses as Array<{
          stat: string;
          value: number;
        }>,
      })
        .then((statBonusIds) => {
          if (statBonusIds.length > 0) {
            item.statBonuses = statBonusIds.map((statBonusId) => String(statBonusId));
          }
          curateCharParamBonusIds({
            charParamBonusesToRemove: [],
            charParamBonusesToStay: [],
            charParamBonusesToAdd: charParamBonuses as Array<{
              charParam: string;
              value: number;
            }>,
          })
            .then((charParamBonusIds) => {
              if (charParamBonusIds.length > 0) {
                item.charParamBonuses = charParamBonusIds.map((charParamBonusId) =>
                  String(charParamBonusId)
                );
              }
              smartUpdateEffects({
                effectsToRemove: [],
                effectsToUpdate: effects,
              })
                .then((effectsIds) => {
                  if (effectsIds.length > 0) {
                    item.effects = effectsIds.map((effectsId) => String(effectsId));
                  }
                  smartUpdateActions({
                    actionsToRemove: [],
                    actionsToUpdate: actions,
                  })
                    .then((actionsIds) => {
                      if (actionsIds.length > 0) {
                        item.actions = actionsIds.map((actionsId) => String(actionsId));
                      }
                      item
                        .save()
                        .then(() => {
                          res.send(item);
                        })
                        .catch((err: Error) => {
                          res.status(500).send(gemServerError(err));
                        });
                    })
                    .catch((err: Error) => {
                      res.status(500).send(gemServerError(err));
                    });
                })
                .catch((err: Error) => {
                  res.status(500).send(gemServerError(err));
                });
            })
            .catch((err: Error) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: Error) => {
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
    charParamBonuses = null,
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Item ID'));
    return;
  }

  findItemById(id as string)
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
      interface ISkillBonusElt extends ISkillBonus {
        _id: ObjectId;
      }
      const skillBonusesToRemove = item.skillBonuses.reduce(
        (result: string[], elt: ISkillBonusElt) => {
          const foundSkillBonus = skillBonuses.find(
            (skillBonus) => skillBonus.skill === String(elt.skill) && skillBonus.value === elt.value
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

      const skillBonusesToAdd = skillBonuses.reduce(
        (
          result: Array<{
            skill: string;
            value: number;
          }>,
          elt: {
            skill: string;
            value: number;
          }
        ) => {
          const foundSkillBonus = item.skillBonuses.find(
            (skillBonus) =>
              typeof skillBonus !== 'string' &&
              String(skillBonus.skill) === elt.skill &&
              skillBonus.value === elt.value
          );
          if (foundSkillBonus === undefined) {
            result.push(elt);
          }
          return result;
        },
        []
      );

      const statBonusesToStay: string[] = [];
      interface IStatBonusElt extends IStatBonus {
        _id: ObjectId;
      }
      const statBonusesToRemove = item.statBonuses.reduce(
        (result: string[], elt: IStatBonusElt) => {
          const foundStatBonus = statBonuses.find(
            (statBonus) => statBonus.stat === String(elt.stat) && statBonus.value === elt.value
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

      const statBonusesToAdd = statBonuses.reduce(
        (
          result: Array<{
            stat: string;
            value: number;
          }>,
          elt: {
            stat: string;
            value: number;
          }
        ) => {
          const foundStatBonus = item.statBonuses.find(
            (statBonus) =>
              typeof statBonus !== 'string' &&
              String(statBonus.stat) === elt.stat &&
              statBonus.value === elt.value
          );
          if (foundStatBonus === undefined) {
            result.push(elt);
          }
          return result;
        },
        []
      );

      const charParamBonusesToStay: string[] = [];
      interface ICharParamBonusElt extends ICharParamBonus {
        _id: ObjectId;
      }
      const charParamBonusesToRemove = item.charParamBonuses.reduce(
        (result: string[], elt: ICharParamBonusElt) => {
          const foundCharParamBonus = charParamBonuses.find(
            (charParamBonus) =>
              charParamBonus.charParam === String(elt.charParam) &&
              charParamBonus.value === elt.value
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

      const charParamBonusesToAdd = charParamBonuses.reduce(
        (
          result: Array<{
            charParam: string;
            value: number;
          }>,
          elt: {
            charParam: string;
            value: number;
          }
        ) => {
          const foundCharParamBonus = item.charParamBonuses.find(
            (charParamBonus) =>
              typeof charParamBonus !== 'string' &&
              String(charParamBonus.charParam) === elt.charParam &&
              charParamBonus.value === elt.value
          );
          if (foundCharParamBonus === undefined) {
            result.push(elt);
          }
          return result;
        },
        []
      );

      interface IEffectElt extends IEffect {
        _id: ObjectId;
      }
      const effectsToRemove = item.effects.reduce((result: string[], elt: IEffectElt) => {
        const foundEffect = effects.find(
          (effect) => effect.id !== undefined && String(effect.id) === String(elt._id)
        );
        if (foundEffect === undefined) {
          result.push(String(elt._id));
        }
        return result;
      }, []);

      interface IActionElt extends IAction {
        _id: ObjectId;
      }
      const actionsToRemove = item.actions.reduce((result: string[], elt: IActionElt) => {
        const foundAction = actions.find(
          (action) => action.id !== undefined && String(action.id) === String(elt._id)
        );
        if (foundAction === undefined) {
          result.push(String(elt._id));
        }
        return result;
      }, []);

      if (i18n !== null) {
        const newIntl = {
          ...(item.i18n !== null && item.i18n !== undefined && item.i18n !== ''
            ? JSON.parse(item.i18n)
            : {}),
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        item.i18n = JSON.stringify(newIntl);
      }

      curateSkillBonusIds({
        skillBonusesToRemove,
        skillBonusesToAdd,
        skillBonusesToStay,
      })
        .then((skillBonusIds) => {
          if (skillBonusIds.length > 0) {
            item.skillBonuses = skillBonusIds.map((skillBonusId) => String(skillBonusId));
          } else if (skillBonuses !== null && skillBonuses.length === 0) {
            item.skillBonuses = [];
          }
          curateStatBonusIds({
            statBonusesToRemove,
            statBonusesToAdd,
            statBonusesToStay,
          })
            .then((statBonusIds) => {
              if (statBonusIds.length > 0) {
                item.statBonuses = statBonusIds.map((statBonusId) => String(statBonusId));
              }
              curateCharParamBonusIds({
                charParamBonusesToRemove,
                charParamBonusesToAdd,
                charParamBonusesToStay,
              })
                .then((charParamBonusIds) => {
                  if (charParamBonusIds.length > 0) {
                    item.charParamBonuses = charParamBonusIds.map((charParamBonusId) =>
                      String(charParamBonusId)
                    );
                  }
                  smartUpdateEffects({
                    effectsToRemove,
                    effectsToUpdate: effects,
                  })
                    .then((effectsIds) => {
                      if (effectsIds.length > 0) {
                        item.effects = effectsIds.map((effectsId) => String(effectsId));
                      }
                      smartUpdateActions({
                        actionsToRemove,
                        actionsToUpdate: actions,
                      })
                        .then((actionsIds) => {
                          if (actionsIds.length > 0) {
                            item.actions = actionsIds.map((actionsId) => String(actionsId));
                          }
                          item
                            .save()
                            .then(() => {
                              res.send({ message: 'Item was updated successfully!', item });
                            })
                            .catch((err: Error) => {
                              res.status(500).send(gemServerError(err));
                            });
                        })
                        .catch((err: Error) => {
                          res.status(500).send(gemServerError(err));
                        });
                    })
                    .catch((err: Error) => {
                      res.status(500).send(gemServerError(err));
                    });
                })
                .catch((err: Error) => {
                  res.status(500).send(gemServerError(err));
                });
            })
            .catch((err: Error) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Item'));
    });
};

const deleteItemById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Item ID'));
      return;
    }
    Item.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteItem = (req: Request, res: Response): void => {
  const { id } = req.body;

  findItemById(id as string)
    .then((item) => {
      const skillBonusesToRemove = item.skillBonuses.map((elt) => elt._id);
      const statBonusesToRemove = item.statBonuses.map((elt) => elt._id);
      const charParamBonusesToRemove = item.charParamBonuses.map((elt) => elt._id);
      const effectsToRemove = item.effects.map((elt) => elt._id);
      const actionsToRemove = item.actions.map((elt) => elt._id);

      curateSkillBonusIds({
        skillBonusesToRemove,
        skillBonusesToAdd: [],
        skillBonusesToStay: [],
      })
        .then(() => {
          curateStatBonusIds({
            statBonusesToRemove,
            statBonusesToAdd: [],
            statBonusesToStay: [],
          })
            .then(() => {
              curateCharParamBonusIds({
                charParamBonusesToRemove,
                charParamBonusesToAdd: [],
                charParamBonusesToStay: [],
              })
                .then(() => {
                  smartUpdateEffects({
                    effectsToRemove,
                    effectsToUpdate: [],
                  })
                    .then(() => {
                      smartUpdateActions({
                        actionsToRemove,
                        actionsToUpdate: [],
                      })
                        .then(() => {
                          deleteItemById(id as string)
                            .then(() => {
                              res.send({ message: 'Item was deleted successfully!' });
                            })
                            .catch((err: Error) => {
                              res.status(500).send(gemServerError(err));
                            });
                        })
                        .catch((err: Error) => {
                          res.status(500).send(gemServerError(err));
                        });
                    })
                    .catch((err: Error) => {
                      res.status(500).send(gemServerError(err));
                    });
                })
                .catch((err: Error) => {
                  res.status(500).send(gemServerError(err));
                });
            })
            .catch((err: Error) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: Error) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Item'));
    });
};

interface CuratedIItem {
  i18n: Record<string, any> | Record<string, unknown>;
  item: any;
}

const findSingle = (req: Request, res: Response): void => {
  const { itemId } = req.query;
  if (itemId === undefined || typeof itemId !== 'string') {
    res.status(400).send(gemInvalidField('Item ID'));
    return;
  }
  findItemById(itemId)
    .then((itemSent) => {
      const curatedActions =
        itemSent.actions.length > 0
          ? itemSent.actions.map((action) => {
              const data = action.toJSON();
              return {
                ...data,
                ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {}),
              };
            })
          : [];
      const curatedEffects =
        itemSent.effects.length > 0
          ? itemSent.effects.map((effect) => {
              const data = effect.toJSON();
              return {
                ...data,
                ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {}),
              };
            })
          : [];
      const item = itemSent.toJSON();
      item.actions = curatedActions;
      item.effects = curatedEffects;
      const sentObj = {
        item,
        i18n: curateI18n(itemSent.i18n),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findItems()
    .then((items) => {
      const curatedItems: CuratedIItem[] = [];
      items.forEach((itemSent) => {
        const curatedActions =
          itemSent.actions.length > 0
            ? itemSent.actions.map((action) => {
                const data = action.toJSON();
                return {
                  ...data,
                  ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {}),
                };
              })
            : [];
        const curatedEffects =
          itemSent.effects.length > 0
            ? itemSent.effects.map((effect) => {
                const data = effect.toJSON();
                return {
                  ...data,
                  ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {}),
                };
              })
            : [];
        const item = itemSent.toJSON();
        item.actions = curatedActions;
        item.effects = curatedEffects;
        curatedItems.push({
          item,
          i18n: curateI18n(itemSent.i18n),
        });
      });

      res.send(curatedItems);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

const findAllStarter = (req: Request, res: Response): void => {
  findItems({ starterKit: { $in: ['always', 'option'] } })
    .then((items) => {
      const curatedItems: CuratedIItem[] = [];
      items.forEach((itemSent) => {
        const curatedActions =
          itemSent.actions.length > 0
            ? itemSent.actions.map((action) => {
                const data = action.toJSON();
                return {
                  ...data,
                  ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {}),
                };
              })
            : [];
        const curatedEffects =
          itemSent.effects.length > 0
            ? itemSent.effects.map((effect) => {
                const data = effect.toJSON();
                return {
                  ...data,
                  ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {}),
                };
              })
            : [];
        const item = itemSent.toJSON();
        item.actions = curatedActions;
        item.effects = curatedEffects;
        curatedItems.push({
          item,
          i18n: curateI18n(itemSent.i18n),
        });
      });

      res.send(curatedItems);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteItem, findAll, findAllStarter, findItemById, findSingle, update };
