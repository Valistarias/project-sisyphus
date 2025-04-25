import type { Request, Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { type ISentAction, smartUpdateActions } from '../action/controller';
import { curateCharParamBonusIds } from '../charParamBonus/controller';
import { type ISentEffect, smartUpdateEffects } from '../effect/controller';
import { curateSkillBonusIds } from '../skillBonus/controller';
import { curateStatBonusIds } from '../statBonus/controller';

import type { InternationalizationType } from '../../utils/types';
import type {
  HydratedIAction,
  HydratedICharParamBonus,
  HydratedIEffect,
  HydratedISkillBonus,
  HydratedIStatBonus,
  IAction,
  ICharParamBonus,
  IEffect,
  ISkillBonus,
  IStatBonus,
} from '../index';
import type { HydratedIImplant, LeanIImplant } from './model';

import { curateI18n } from '../../utils';

const { Implant } = db;

interface findAllPayload {
  starterKit?: string | Record<string, string[]>;
}

const findImplants = async (options?: findAllPayload): Promise<LeanIImplant[]> =>
  await new Promise((resolve, reject) => {
    Implant.find(options ?? {})
      .lean()
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: Array<IAction<string>> }>('actions')
      .populate<{ skillBonuses: ISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: IStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: ICharParamBonus[] }>('charParamBonuses')
      .then((res: LeanIImplant[]) => {
        resolve(res);
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findCompleteImplantById = async (id: string): Promise<HydratedIImplant> =>
  await new Promise((resolve, reject) => {
    Implant.findById(id)
      .populate<{ effects: HydratedIEffect[] }>('effects')
      .populate<{ actions: HydratedIAction[] }>('actions')
      .populate<{ skillBonuses: HydratedISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: HydratedIStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: HydratedICharParamBonus[] }>('charParamBonuses')
      .then((res?: HydratedIImplant | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Implant'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findImplantById = async (id: string): Promise<LeanIImplant> =>
  await new Promise((resolve, reject) => {
    Implant.findById(id)
      .lean()
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: Array<IAction<string>> }>('actions')
      .populate<{ skillBonuses: ISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: IStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: ICharParamBonus[] }>('charParamBonuses')
      .then((res?: LeanIImplant | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Implant'));
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
    bodyParts,
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
    bodyParts === undefined
  ) {
    res.status(400).send(gemInvalidField('Implant'));

    return;
  }

  const implant = new Implant({
    title,
    summary,
    rarity,
    starterKit,
    cost,
    itemType,
    itemModifiers,
    bodyParts,
  });

  if (i18n !== null) {
    implant.i18n = JSON.stringify(i18n);
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
        implant.skillBonuses = skillBonusIds.map((skillBonusId) => String(skillBonusId));
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
            implant.statBonuses = statBonusIds.map((statBonusId) => String(statBonusId));
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
                implant.charParamBonuses = charParamBonusIds.map((charParamBonusId) =>
                  String(charParamBonusId)
                );
              }
              smartUpdateEffects({
                effectsToRemove: [],
                effectsToUpdate: effects,
              })
                .then((effectsIds) => {
                  if (effectsIds.length > 0) {
                    implant.effects = effectsIds.map((effectsId) => String(effectsId));
                  }
                  smartUpdateActions({
                    actionsToRemove: [],
                    actionsToUpdate: actions,
                  })
                    .then((actionsIds) => {
                      if (actionsIds.length > 0) {
                        implant.actions = actionsIds.map((actionsId) => String(actionsId));
                      }
                      implant
                        .save()
                        .then(() => {
                          res.send(implant);
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
    bodyParts = null,
    effects = null,
    actions = null,
    skillBonuses = null,
    statBonuses = null,
    charParamBonuses = null,
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    i18n: InternationalizationType | null;
    rarity: string | null;
    starterKit: 'always' | 'never' | 'option' | null;
    cost: number | null;
    itemType: string | null;
    itemModifiers: string[] | null;
    bodyParts: string[] | null;
    effects: ISentEffect[] | null;
    actions: ISentAction[] | null;
    skillBonuses: Array<{
      skill: string;
      value: number;
    }> | null;
    statBonuses: Array<{
      stat: string;
      value: number;
    }> | null;
    charParamBonuses: Array<{
      charParam: string;
      value: number;
    }> | null;
    overrides: string[] | null;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Implant ID'));

    return;
  }

  findCompleteImplantById(id)
    .then((implant) => {
      if (title !== null) {
        implant.title = title;
      }
      if (rarity !== null) {
        implant.rarity = rarity;
      }
      if (starterKit !== null) {
        implant.starterKit = starterKit;
      }
      if (summary !== null) {
        implant.summary = summary;
      }
      if (cost !== null) {
        implant.cost = cost;
      }
      if (itemType !== null) {
        implant.itemType = itemType;
      }
      if (itemModifiers !== null) {
        implant.itemModifiers = itemModifiers;
      }
      if (bodyParts !== null) {
        implant.bodyParts = bodyParts;
      }

      const skillBonusesToStay: string[] = [];
      let skillBonusesToRemove: string[] = [];
      let skillBonusesToAdd: Array<{
        skill: string;
        value: number;
      }> = [];

      if (skillBonuses !== null) {
        skillBonusesToRemove = implant.skillBonuses.reduce(
          (result: string[], elt: HydratedISkillBonus) => {
            const foundSkillBonus = skillBonuses.find(
              (skillBonus) =>
                skillBonus.skill === String(elt.skill) && skillBonus.value === elt.value
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
              skill: string;
              value: number;
            }>,
            elt: {
              skill: string;
              value: number;
            }
          ) => {
            const foundSkillBonus = implant.skillBonuses.find(
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
      }

      const statBonusesToStay: string[] = [];
      let statBonusesToRemove: string[] = [];
      let statBonusesToAdd: Array<{
        stat: string;
        value: number;
      }> = [];

      if (statBonuses !== null) {
        statBonusesToRemove = implant.statBonuses.reduce(
          (result: string[], elt: HydratedIStatBonus) => {
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

        statBonusesToAdd = statBonuses.reduce(
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
            const foundStatBonus = implant.statBonuses.find(
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
      }

      const charParamBonusesToStay: string[] = [];
      let charParamBonusesToRemove: string[] = [];
      let charParamBonusesToAdd: Array<{
        charParam: string;
        value: number;
      }> = [];
      if (charParamBonuses !== null) {
        charParamBonusesToRemove = implant.charParamBonuses.reduce(
          (result: string[], elt: HydratedICharParamBonus) => {
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

        charParamBonusesToAdd = charParamBonuses.reduce(
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
            const foundCharParamBonus = implant.charParamBonuses.find(
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
      }

      let effectsToRemove: string[] = [];

      if (effects !== null) {
        effectsToRemove = implant.effects.reduce((result: string[], elt: HydratedIEffect) => {
          const foundEffect = effects.find(
            (effect) => effect.id !== undefined && String(effect.id) === String(elt._id)
          );
          if (foundEffect === undefined) {
            result.push(String(elt._id));
          }

          return result;
        }, []);
      }

      let actionsToRemove: string[] = [];

      if (actions !== null) {
        actionsToRemove = implant.actions.reduce((result: string[], elt: HydratedIAction) => {
          const foundAction = actions.find(
            (action) => action.id !== undefined && String(action.id) === String(elt._id)
          );
          if (foundAction === undefined) {
            result.push(String(elt._id));
          }

          return result;
        }, []);
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = {
          ...(implant.i18n !== undefined && implant.i18n !== '' ? JSON.parse(implant.i18n) : {}),
        };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        implant.i18n = JSON.stringify(newIntl);
      }

      curateSkillBonusIds({
        skillBonusesToRemove,
        skillBonusesToAdd,
        skillBonusesToStay,
      })
        .then((skillBonusIds) => {
          if (skillBonusIds.length > 0) {
            implant.skillBonuses = skillBonusIds.map((skillBonusId) => String(skillBonusId));
          } else if (skillBonuses !== null && skillBonuses.length === 0) {
            implant.skillBonuses = [];
          }
          curateStatBonusIds({
            statBonusesToRemove,
            statBonusesToAdd,
            statBonusesToStay,
          })
            .then((statBonusIds) => {
              if (statBonusIds.length > 0) {
                implant.statBonuses = statBonusIds.map((statBonusId) => String(statBonusId));
              }
              curateCharParamBonusIds({
                charParamBonusesToRemove,
                charParamBonusesToAdd,
                charParamBonusesToStay,
              })
                .then((charParamBonusIds) => {
                  if (charParamBonusIds.length > 0) {
                    implant.charParamBonuses = charParamBonusIds.map((charParamBonusId) =>
                      String(charParamBonusId)
                    );
                  }
                  smartUpdateEffects({
                    effectsToRemove,
                    effectsToUpdate: effects ?? [],
                  })
                    .then((effectsIds) => {
                      if (effectsIds.length > 0) {
                        implant.effects = effectsIds.map((effectsId) => String(effectsId));
                      }
                      smartUpdateActions({
                        actionsToRemove,
                        actionsToUpdate: actions ?? [],
                      })
                        .then((actionsIds) => {
                          if (actionsIds.length > 0) {
                            implant.actions = actionsIds.map((actionsId) => String(actionsId));
                          }
                          implant
                            .save()
                            .then(() => {
                              res.send({
                                message: 'Implant was updated successfully!',
                                implant,
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
      res.status(404).send(gemNotFound('Implant'));
    });
};

const deleteImplantById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Implant ID'));

      return;
    }
    Implant.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteImplant = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;

  findCompleteImplantById(id)
    .then(
      (
        implant: Omit<
          HydratedIImplant,
          | 'effects'
          | 'actions'
          | 'skillBonuses'
          | 'statBonuses'
          | 'charParamBonuses'
          | 'skillBranch'
          | 'cyberFrameBranch'
        > & {
          effects: HydratedIEffect[];
          actions: HydratedIAction[];
          skillBonuses: HydratedISkillBonus[];
          statBonuses: HydratedIStatBonus[];
          charParamBonuses: HydratedICharParamBonus[];
        }
      ) => {
        const skillBonusesToRemove = implant.skillBonuses.map((elt) => String(elt._id));
        const statBonusesToRemove = implant.statBonuses.map((elt) => String(elt._id));
        const charParamBonusesToRemove = implant.charParamBonuses.map((elt) => String(elt._id));
        const effectsToRemove = implant.effects.map((elt) => String(elt._id));
        const actionsToRemove = implant.actions.map((elt) => String(elt._id));

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
                            deleteImplantById(id)
                              .then(() => {
                                res.send({ message: 'Implant was deleted successfully!' });
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
      }
    )
    .catch(() => {
      res.status(404).send(gemNotFound('Implant'));
    });
};

export interface CuratedIImplantToSend {
  implant: Omit<LeanIImplant, 'effects' | 'actions'> & {
    effects: Array<{
      effect: IEffect;
      i18n?: InternationalizationType;
    }>;
    actions: Array<{
      action: IAction<string>;
      i18n?: InternationalizationType;
    }>;
  };
  i18n?: InternationalizationType;
}

export const curateSingleImplant = (implantSent: LeanIImplant): CuratedIImplantToSend => {
  const curatedActions =
    implantSent.actions.length > 0
      ? implantSent.actions.map((action) => ({
          action,
          i18n: curateI18n(action.i18n),
        }))
      : [];
  const curatedEffects =
    implantSent.effects.length > 0
      ? implantSent.effects.map((effect) => ({
          effect,
          i18n: curateI18n(effect.i18n),
        }))
      : [];

  return {
    implant: {
      ...implantSent,
      actions: curatedActions,
      effects: curatedEffects,
    },
    i18n: curateI18n(implantSent.i18n),
  };
};

const findSingle = (req: Request, res: Response): void => {
  const { implantId } = req.query;
  if (implantId === undefined || typeof implantId !== 'string') {
    res.status(400).send(gemInvalidField('Implant ID'));

    return;
  }
  findImplantById(implantId)
    .then((implantSent) => {
      res.send(curateSingleImplant(implantSent));
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findImplants()
    .then((implants: LeanIImplant[]) => {
      const curatedImplants: CuratedIImplantToSend[] = [];
      implants.forEach((implantSent) => {
        curatedImplants.push(curateSingleImplant(implantSent));
      });

      res.send(curatedImplants);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAllStarter = (req: Request, res: Response): void => {
  findImplants({ starterKit: { $in: ['always', 'option'] } })
    .then((implants: LeanIImplant[]) => {
      const curatedImplants: CuratedIImplantToSend[] = [];
      implants.forEach((implantSent) => {
        curatedImplants.push(curateSingleImplant(implantSent));
      });

      res.send(curatedImplants);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export { create, deleteImplant, findAll, findAllStarter, findImplantById, findSingle, update };
