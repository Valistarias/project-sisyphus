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
import type { HydratedIArmor, IArmor } from './model';

import { curateI18n } from '../../utils';

const { Armor } = db;

interface findAllPayload {
  starterKit?: string | Record<string, string[]>
}

const findArmors = async (
  options?: findAllPayload
): Promise<HydratedIArmor[]> =>
  await new Promise((resolve, reject) => {
    Armor.find(options ?? {})
      .populate<{ effects: HydratedIEffect[] }>('effects')
      .populate<{ actions: HydratedIAction[] }>('actions')
      .populate<{ skillBonuses: HydratedISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: HydratedIStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: HydratedICharParamBonus[] }>('charParamBonuses')
      .then((res: HydratedIArmor[]) => {
        if (res.length === 0) {
          reject(gemNotFound('Armors'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findArmorById = async (id: string): Promise<HydratedIArmor> =>
  await new Promise((resolve, reject) => {
    Armor.findById(id)
      .populate<{ effects: HydratedIEffect[] }>('effects')
      .populate<{ actions: HydratedIAction[] }>('actions')
      .populate<{ skillBonuses: HydratedISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: HydratedIStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: HydratedICharParamBonus[] }>('charParamBonuses')
      .then((res?: HydratedIArmor | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Armor'));
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
    armorType,
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
    || armorType === undefined
  ) {
    res.status(400).send(gemInvalidField('Armor'));

    return;
  }

  const armor = new Armor({
    title,
    summary,
    rarity,
    starterKit,
    cost,
    itemType,
    itemModifiers,
    armorType
  });

  if (i18n !== null) {
    armor.i18n = JSON.stringify(i18n);
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
        armor.skillBonuses = skillBonusIds.map(
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
            armor.statBonuses = statBonusIds.map(
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
                armor.charParamBonuses = charParamBonusIds.map(
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
                    armor.effects = effectsIds.map(
                      effectsId => String(effectsId));
                  }
                  smartUpdateActions({
                    actionsToRemove: [],
                    actionsToUpdate: actions
                  })
                    .then((actionsIds) => {
                      if (actionsIds.length > 0) {
                        armor.actions = actionsIds.map(
                          actionsId => String(actionsId)
                        );
                      }
                      armor
                        .save()
                        .then(() => {
                          res.send(armor);
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
    armorType,
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
    armorType: ObjectId | null
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
    res.status(400).send(gemInvalidField('Armor ID'));

    return;
  }

  findArmorById(id)
    .then((armor) => {
      if (title !== null) {
        armor.title = title;
      }
      if (rarity !== null) {
        armor.rarity = rarity;
      }
      if (starterKit !== null) {
        armor.starterKit = starterKit;
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
      if (itemModifiers !== null) {
        armor.itemModifiers = itemModifiers;
      }
      if (armorType !== null) {
        armor.armorType = armorType;
      }

      const skillBonusesToStay: string[] = [];
      let skillBonusesToRemove: string[] = [];
      let skillBonusesToAdd: Array<{
        skill: string
        value: number
      }> = [];

      if (skillBonuses !== null) {
        skillBonusesToRemove = armor.skillBonuses.reduce(
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
            const foundSkillBonus = armor.skillBonuses.find(
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
        statBonusesToRemove = armor.statBonuses.reduce(
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
            const foundStatBonus = armor.statBonuses.find(
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
        charParamBonusesToRemove = armor.charParamBonuses.reduce(
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
            const foundCharParamBonus = armor.charParamBonuses.find(
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
        effectsToRemove = armor.effects.reduce(
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
        actionsToRemove = armor.actions.reduce(
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
          armor.i18n !== undefined
          && armor.i18n !== ''
            ? JSON.parse(armor.i18n)
            : {}
        ) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        armor.i18n = JSON.stringify(newIntl);
      }

      curateSkillBonusIds({
        skillBonusesToRemove,
        skillBonusesToAdd,
        skillBonusesToStay
      })
        .then((skillBonusIds) => {
          if (skillBonusIds.length > 0) {
            armor.skillBonuses = skillBonusIds.map(
              skillBonusId => String(skillBonusId)
            );
          } else if (skillBonuses !== null && skillBonuses.length === 0) {
            armor.skillBonuses = [];
          }
          curateStatBonusIds({
            statBonusesToRemove,
            statBonusesToAdd,
            statBonusesToStay
          })
            .then((statBonusIds) => {
              if (statBonusIds.length > 0) {
                armor.statBonuses = statBonusIds.map(
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
                    armor.charParamBonuses = charParamBonusIds.map(
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
                        armor.effects = effectsIds.map(
                          effectsId => String(effectsId)
                        );
                      }
                      smartUpdateActions({
                        actionsToRemove,
                        actionsToUpdate: actions ?? []
                      })
                        .then((actionsIds) => {
                          if (actionsIds.length > 0) {
                            armor.actions = actionsIds.map(
                              actionsId => String(actionsId)
                            );
                          }
                          armor
                            .save()
                            .then(() => {
                              res.send({
                                message: 'Armor was updated successfully!', armor
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
      res.status(404).send(gemNotFound('Armor'));
    });
};

const deleteArmorById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Armor ID'));

      return;
    }
    Armor.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteArmor = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;

  findArmorById(id)
    .then((armor: HydratedDocument<
      Omit<IArmor,
      | 'effects'
      | 'actions'
      | 'skillBonuses'
      | 'statBonuses'
      | 'charParamBonuses'
      | 'skillBranch'
      | 'cyberFrameBranch'
      > & {
        effects: HydratedIEffect[]
        actions: HydratedIAction[]
        skillBonuses: HydratedISkillBonus[]
        statBonuses: HydratedIStatBonus[]
        charParamBonuses: HydratedICharParamBonus[]
      }
    >) => {
      const skillBonusesToRemove = armor.skillBonuses.map(
        elt => String(elt._id)
      );
      const statBonusesToRemove = armor.statBonuses.map(
        elt => String(elt._id)
      );
      const charParamBonusesToRemove = armor.charParamBonuses.map(
        elt => String(elt._id)
      );
      const effectsToRemove = armor.effects.map(elt => String(elt._id));
      const actionsToRemove = armor.actions.map(elt => String(elt._id));

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
                          deleteArmorById(id)
                            .then(() => {
                              res.send({ message: 'Armor was deleted successfully!' });
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
      res.status(404).send(gemNotFound('Armor'));
    });
};

export type IArmorSent = HydratedDocument<
  Omit<
    IArmor,
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

export interface CuratedIArmorToSend {
  armor: Omit<
    FlattenMaps<IArmor>,
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

export const curateSingleArmor = (
  armorSent: IArmorSent,
  alreadyJson = false
): CuratedIArmorToSend => {
  const curatedActions
  = armorSent.actions.length > 0
    ? armorSent.actions.map((action) => {
        const data = alreadyJson ? action : action.toJSON();

        return {
          action: data,
          i18n: curateI18n(data.i18n)
        };
      })
    : [];
  const curatedEffects
  = armorSent.effects.length > 0
    ? armorSent.effects.map((effect) => {
        const data = effect.toJSON();

        return {
          effect: data,
          i18n: curateI18n(data.i18n)
        };
      })
    : [];

  return {
    armor: {
      ...armorSent.toJSON(),
      actions: curatedActions,
      effects: curatedEffects
    },
    i18n: curateI18n(armorSent.i18n)
  };
};

const findSingle = (req: Request, res: Response): void => {
  const { armorId } = req.query;
  if (armorId === undefined || typeof armorId !== 'string') {
    res.status(400).send(gemInvalidField('Armor ID'));

    return;
  }
  findArmorById(armorId)
    .then((armorSent: IArmorSent) => {
      res.send(curateSingleArmor(armorSent));
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findArmors()
    .then((implants: IArmorSent[]) => {
      const curatedArmors: CuratedIArmorToSend[] = [];
      implants.forEach((armorSent) => {
        curatedArmors.push(curateSingleArmor(armorSent));
      });

      res.send(curatedArmors);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAllStarter = (req: Request, res: Response): void => {
  findArmors({ starterKit: { $in: ['always', 'option'] } })
    .then((implants: IArmorSent[]) => {
      const curatedArmors: CuratedIArmorToSend[] = [];
      implants.forEach((armorSent) => {
        curatedArmors.push(curateSingleArmor(armorSent));
      });

      res.send(curatedArmors);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  deleteArmor,
  findAll,
  findAllStarter,
  findArmorById,
  findSingle,
  update
};
