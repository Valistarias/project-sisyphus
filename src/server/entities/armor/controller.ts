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
  type ICyberFrameBranch,
  type IEffect,
  type ISkillBonus,
  type ISkillBranch,
  type IStatBonus,
} from '../index';
import { curateSkillBonusIds } from '../skillBonus/controller';
import { curateStatBonusIds } from '../statBonus/controller';

import { type HydratedIArmor } from './model';

const { Armor } = db;

const findArmors = async (): Promise<HydratedIArmor[]> =>
  await new Promise((resolve, reject) => {
    Armor.find()
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: IAction[] }>('actions')
      .populate<{ skillBonuses: ISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: IStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: ICharParamBonus[] }>('charParamBonuses')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Armors'));
        } else {
          resolve(res as HydratedIArmor[]);
        }
      })
      .catch(async (err: Error) => {
        reject(err);
      });
  });

const findArmorById = async (id: string): Promise<HydratedIArmor> =>
  await new Promise((resolve, reject) => {
    Armor.findById(id)
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: IAction[] }>('actions')
      .populate<{ skillBonuses: ISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: IStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: ICharParamBonus[] }>('charParamBonuses')
      .populate<{ skillBranch: ISkillBranch }>('skillBranch')
      .populate<{ cyberFrameBranch: ICyberFrameBranch }>('cyberFrameBranch')
      .then(async (res) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Armor'));
        } else {
          resolve(res as HydratedIArmor);
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
    cost,
    itemType,
    armorType,
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
    itemType === undefined ||
    armorType === undefined
  ) {
    res.status(400).send(gemInvalidField('Armor'));
    return;
  }

  const armor = new Armor({
    title,
    summary,
    rarity,
    cost,
    itemType,
    armorType,
  });

  if (i18n !== null) {
    armor.i18n = JSON.stringify(i18n);
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
        armor.skillBonuses = skillBonusIds.map((skillBonusId) => String(skillBonusId));
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
            armor.statBonuses = statBonusIds.map((statBonusId) => String(statBonusId));
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
                armor.charParamBonuses = charParamBonusIds.map((charParamBonusId) =>
                  String(charParamBonusId)
                );
              }
              smartUpdateEffects({
                effectsToRemove: [],
                effectsToUpdate: effects,
              })
                .then((effectsIds) => {
                  if (effectsIds.length > 0) {
                    armor.effects = effectsIds.map((effectsId) => String(effectsId));
                  }
                  smartUpdateActions({
                    actionsToRemove: [],
                    actionsToUpdate: actions,
                  })
                    .then((actionsIds) => {
                      if (actionsIds.length > 0) {
                        armor.actions = actionsIds.map((actionsId) => String(actionsId));
                      }
                      armor
                        .save()
                        .then(() => {
                          res.send(armor);
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
    cost,
    itemType,
    armorType,
    effects = null,
    actions = null,
    skillBonuses = null,
    statBonuses = null,
    charParamBonuses = null,
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Armor ID'));
    return;
  }

  findArmorById(id as string)
    .then((armor) => {
      if (title !== null) {
        armor.title = title;
      }
      if (rarity !== null) {
        armor.rarity = rarity;
      }
      if (summary !== null) {
        armor.summary = summary;
      }
      if (cost !== null) {
        armor.cost = cost;
      }
      if (itemType !== null) {
        armor.itemType = itemType;
      }
      if (armorType !== null) {
        armor.armorType = armorType;
      }

      const skillBonusesToStay: string[] = [];
      interface ISkillBonusElt extends ISkillBonus {
        _id: ObjectId;
      }
      const skillBonusesToRemove = armor.skillBonuses.reduce(
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
          const foundSkillBonus = armor.skillBonuses.find(
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
      const statBonusesToRemove = armor.statBonuses.reduce(
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
          const foundStatBonus = armor.statBonuses.find(
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
      const charParamBonusesToRemove = armor.charParamBonuses.reduce(
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
          const foundCharParamBonus = armor.charParamBonuses.find(
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
      const effectsToRemove = armor.effects.reduce((result: string[], elt: IEffectElt) => {
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
      const actionsToRemove = armor.actions.reduce((result: string[], elt: IActionElt) => {
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
          ...(armor.i18n !== null && armor.i18n !== undefined && armor.i18n !== ''
            ? JSON.parse(armor.i18n)
            : {}),
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        armor.i18n = JSON.stringify(newIntl);
      }

      curateSkillBonusIds({
        skillBonusesToRemove,
        skillBonusesToAdd,
        skillBonusesToStay,
      })
        .then((skillBonusIds) => {
          if (skillBonusIds.length > 0) {
            armor.skillBonuses = skillBonusIds.map((skillBonusId) => String(skillBonusId));
          } else if (skillBonuses !== null && skillBonuses.length === 0) {
            armor.skillBonuses = [];
          }
          curateStatBonusIds({
            statBonusesToRemove,
            statBonusesToAdd,
            statBonusesToStay,
          })
            .then((statBonusIds) => {
              if (statBonusIds.length > 0) {
                armor.statBonuses = statBonusIds.map((statBonusId) => String(statBonusId));
              }
              curateCharParamBonusIds({
                charParamBonusesToRemove,
                charParamBonusesToAdd,
                charParamBonusesToStay,
              })
                .then((charParamBonusIds) => {
                  if (charParamBonusIds.length > 0) {
                    armor.charParamBonuses = charParamBonusIds.map((charParamBonusId) =>
                      String(charParamBonusId)
                    );
                  }
                  smartUpdateEffects({
                    effectsToRemove,
                    effectsToUpdate: effects,
                  })
                    .then((effectsIds) => {
                      if (effectsIds.length > 0) {
                        armor.effects = effectsIds.map((effectsId) => String(effectsId));
                      }
                      smartUpdateActions({
                        actionsToRemove,
                        actionsToUpdate: actions,
                      })
                        .then((actionsIds) => {
                          if (actionsIds.length > 0) {
                            armor.actions = actionsIds.map((actionsId) => String(actionsId));
                          }
                          armor
                            .save()
                            .then(() => {
                              res.send({ message: 'Armor was updated successfully!', armor });
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
      res.status(404).send(gemNotFound('Armor'));
    });
};

const deleteArmorById = async (id: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Armor ID'));
      return;
    }
    Armor.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: Error) => {
        reject(gemServerError(err));
      });
  });

const deleteArmor = (req: Request, res: Response): void => {
  const { id } = req.body;

  findArmorById(id as string)
    .then((armor) => {
      const skillBonusesToRemove = armor.skillBonuses.map((elt) => elt._id);
      const statBonusesToRemove = armor.statBonuses.map((elt) => elt._id);
      const charParamBonusesToRemove = armor.charParamBonuses.map((elt) => elt._id);
      const effectsToRemove = armor.effects.map((elt) => elt._id);
      const actionsToRemove = armor.actions.map((elt) => elt._id);

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
                          deleteArmorById(id as string)
                            .then(() => {
                              res.send({ message: 'Armor was deleted successfully!' });
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
      res.status(404).send(gemNotFound('Armor'));
    });
};

interface CuratedIArmor {
  i18n: Record<string, any> | Record<string, unknown>;
  armor: any;
}

const curateArmor = (armor: HydratedIArmor): Record<string, any> => {
  if (armor.i18n === null || armor.i18n === '' || armor.i18n === undefined) {
    return {};
  }
  return JSON.parse(armor.i18n);
};

const findSingle = (req: Request, res: Response): void => {
  const { armorId } = req.query;
  if (armorId === undefined || typeof armorId !== 'string') {
    res.status(400).send(gemInvalidField('Armor ID'));
    return;
  }
  findArmorById(armorId)
    .then((armorSent) => {
      const curatedActions =
        armorSent.actions.length > 0
          ? armorSent.actions.map((action) => {
              const data = action.toJSON();
              return {
                ...data,
                ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {}),
              };
            })
          : [];
      const curatedEffects =
        armorSent.effects.length > 0
          ? armorSent.effects.map((effect) => {
              const data = effect.toJSON();
              return {
                ...data,
                ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {}),
              };
            })
          : [];
      const armor = armorSent.toJSON();
      armor.actions = curatedActions;
      armor.effects = curatedEffects;
      const sentObj = {
        armor,
        i18n: curateArmor(armorSent),
      };
      res.send(sentObj);
    })
    .catch((err: Error) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findArmors()
    .then((armors) => {
      const curatedArmors: CuratedIArmor[] = [];
      armors.forEach((armorSent) => {
        const curatedActions =
          armorSent.actions.length > 0
            ? armorSent.actions.map((action) => {
                const data = action.toJSON();
                return {
                  ...data,
                  ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {}),
                };
              })
            : [];
        const curatedEffects =
          armorSent.effects.length > 0
            ? armorSent.effects.map((effect) => {
                const data = effect.toJSON();
                return {
                  ...data,
                  ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {}),
                };
              })
            : [];
        const armor = armorSent.toJSON();
        armor.actions = curatedActions;
        armor.effects = curatedEffects;
        curatedArmors.push({
          armor,
          i18n: curateArmor(armorSent),
        });
      });

      res.send(curatedArmors);
    })
    .catch((err: Error) => res.status(500).send(gemServerError(err)));
};

export { create, deleteArmor, findAll, findArmorById, findSingle, update };
