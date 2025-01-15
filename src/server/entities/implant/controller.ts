import type {
  Request, Response
} from 'express';
import type { ObjectId } from 'mongoose';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';
import { smartUpdateActions } from '../action/controller';
import { curateCharParamBonusIds } from '../charParamBonus/controller';
import { smartUpdateEffects } from '../effect/controller';
import { curateSkillBonusIds } from '../skillBonus/controller';
import { curateStatBonusIds } from '../statBonus/controller';

import type { InternationalizationType } from '../../utils/types';
import type {
  IAction, ICharParamBonus, IEffect, ISkillBonus, IStatBonus
} from '../index';
import type { HydratedIImplant } from './model';

import { curateI18n } from '../../utils';

const { Implant } = db;

interface findAllPayload {
  starterKit?: string | Record<string, string[]>
}

const findImplants = async (options?: findAllPayload): Promise<HydratedIImplant[]> =>
  await new Promise((resolve, reject) => {
    Implant.find(options ?? {})
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: IAction[] }>('actions')
      .populate<{ skillBonuses: ISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: IStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: ICharParamBonus[] }>('charParamBonuses')
      .then((res: HydratedIImplant[]) => {
        if (res.length === 0) {
          reject(gemNotFound('Implants'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findImplantById = async (id: string): Promise<HydratedIImplant> =>
  await new Promise((resolve, reject) => {
    Implant.findById(id)
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: IAction[] }>('actions')
      .populate<{ skillBonuses: ISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: IStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: ICharParamBonus[] }>('charParamBonuses')
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
    charParamBonuses
  } = req.body;
  if (
    title === undefined
    || summary === undefined
    || rarity === undefined
    || cost === undefined
    || itemType === undefined
    || bodyParts === undefined
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
    bodyParts
  });

  if (i18n !== null) {
    implant.i18n = JSON.stringify(i18n);
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
        implant.skillBonuses = skillBonusIds.map(skillBonusId => String(skillBonusId));
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
            implant.statBonuses = statBonusIds.map(statBonusId => String(statBonusId));
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
                implant.charParamBonuses = charParamBonusIds.map(charParamBonusId =>
                  String(charParamBonusId)
                );
              }
              smartUpdateEffects({
                effectsToRemove: [],
                effectsToUpdate: effects
              })
                .then((effectsIds) => {
                  if (effectsIds.length > 0) {
                    implant.effects = effectsIds.map(effectsId => String(effectsId));
                  }
                  smartUpdateActions({
                    actionsToRemove: [],
                    actionsToUpdate: actions
                  })
                    .then((actionsIds) => {
                      if (actionsIds.length > 0) {
                        implant.actions = actionsIds.map(actionsId => String(actionsId));
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
    charParamBonuses = null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Implant ID'));

    return;
  }

  findImplantById(id as string)
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
      interface ISkillBonusElt extends ISkillBonus {
        _id: ObjectId
      }
      const skillBonusesToRemove = implant.skillBonuses.reduce(
        (result: string[], elt: ISkillBonusElt) => {
          const foundSkillBonus = skillBonuses.find(
            skillBonus => skillBonus.skill === String(elt.skill) && skillBonus.value === elt.value
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
            skill: string
            value: number
          }>,
          elt: {
            skill: string
            value: number
          }
        ) => {
          const foundSkillBonus = implant.skillBonuses.find(
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

      const statBonusesToStay: string[] = [];
      interface IStatBonusElt extends IStatBonus {
        _id: ObjectId
      }
      const statBonusesToRemove = implant.statBonuses.reduce(
        (result: string[], elt: IStatBonusElt) => {
          const foundStatBonus = statBonuses.find(
            statBonus => statBonus.stat === String(elt.stat) && statBonus.value === elt.value
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
            stat: string
            value: number
          }>,
          elt: {
            stat: string
            value: number
          }
        ) => {
          const foundStatBonus = implant.statBonuses.find(
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

      const charParamBonusesToStay: string[] = [];
      interface ICharParamBonusElt extends ICharParamBonus {
        _id: ObjectId
      }
      const charParamBonusesToRemove = implant.charParamBonuses.reduce(
        (result: string[], elt: ICharParamBonusElt) => {
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

      const charParamBonusesToAdd = charParamBonuses.reduce(
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
          const foundCharParamBonus = implant.charParamBonuses.find(
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

      interface IEffectElt extends IEffect {
        _id: ObjectId
      }
      const effectsToRemove = implant.effects.reduce((result: string[], elt: IEffectElt) => {
        const foundEffect = effects.find(
          effect => effect.id !== undefined && String(effect.id) === String(elt._id)
        );
        if (foundEffect === undefined) {
          result.push(String(elt._id));
        }

        return result;
      }, []);

      interface IActionElt extends IAction {
        _id: ObjectId
      }
      const actionsToRemove = implant.actions.reduce((result: string[], elt: IActionElt) => {
        const foundAction = actions.find(
          action => action.id !== undefined && String(action.id) === String(elt._id)
        );
        if (foundAction === undefined) {
          result.push(String(elt._id));
        }

        return result;
      }, []);

      if (i18n !== null) {
        const newIntl: InternationalizationType = { ...(implant.i18n !== null && implant.i18n !== undefined && implant.i18n !== ''
          ? JSON.parse(implant.i18n)
          : {}) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        implant.i18n = JSON.stringify(newIntl);
      }

      curateSkillBonusIds({
        skillBonusesToRemove,
        skillBonusesToAdd,
        skillBonusesToStay
      })
        .then((skillBonusIds) => {
          if (skillBonusIds.length > 0) {
            implant.skillBonuses = skillBonusIds.map(skillBonusId => String(skillBonusId));
          } else if (skillBonuses !== null && skillBonuses.length === 0) {
            implant.skillBonuses = [];
          }
          curateStatBonusIds({
            statBonusesToRemove,
            statBonusesToAdd,
            statBonusesToStay
          })
            .then((statBonusIds) => {
              if (statBonusIds.length > 0) {
                implant.statBonuses = statBonusIds.map(statBonusId => String(statBonusId));
              }
              curateCharParamBonusIds({
                charParamBonusesToRemove,
                charParamBonusesToAdd,
                charParamBonusesToStay
              })
                .then((charParamBonusIds) => {
                  if (charParamBonusIds.length > 0) {
                    implant.charParamBonuses = charParamBonusIds.map(charParamBonusId =>
                      String(charParamBonusId)
                    );
                  }
                  smartUpdateEffects({
                    effectsToRemove,
                    effectsToUpdate: effects
                  })
                    .then((effectsIds) => {
                      if (effectsIds.length > 0) {
                        implant.effects = effectsIds.map(effectsId => String(effectsId));
                      }
                      smartUpdateActions({
                        actionsToRemove,
                        actionsToUpdate: actions
                      })
                        .then((actionsIds) => {
                          if (actionsIds.length > 0) {
                            implant.actions = actionsIds.map(actionsId => String(actionsId));
                          }
                          implant
                            .save()
                            .then(() => {
                              res.send({
                                message: 'Implant was updated successfully!', implant
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

  findImplantById(id)
    .then((implant) => {
      const skillBonusesToRemove = implant.skillBonuses.map(elt => elt._id);
      const statBonusesToRemove = implant.statBonuses.map(elt => elt._id);
      const charParamBonusesToRemove = implant.charParamBonuses.map(elt => elt._id);
      const effectsToRemove = implant.effects.map(elt => elt._id);
      const actionsToRemove = implant.actions.map(elt => elt._id);

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
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Implant'));
    });
};

interface CuratedIImplant {
  i18n?: InternationalizationType
  implant: any
}

const findSingle = (req: Request, res: Response): void => {
  const { implantId } = req.query;
  if (implantId === undefined || typeof implantId !== 'string') {
    res.status(400).send(gemInvalidField('Implant ID'));

    return;
  }
  findImplantById(implantId)
    .then((implantSent) => {
      const curatedActions
        = implantSent.actions.length > 0
          ? implantSent.actions.map((action) => {
              const data = action.toJSON();

              return {
                action: data,
                i18n: JSON.parse(data.i18n as string)
              };
            })
          : [];
      const curatedEffects
        = implantSent.effects.length > 0
          ? implantSent.effects.map((effect) => {
              const data = effect.toJSON();

              return {
                effect: data,
                i18n: JSON.parse(data.i18n as string)
              };
            })
          : [];
      const implant: any = implantSent.toJSON();
      implant.actions = curatedActions;
      implant.effects = curatedEffects;
      const sentObj = {
        implant,
        i18n: curateI18n(implantSent.i18n)
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findImplants()
    .then((implants) => {
      const curatedImplants: CuratedIImplant[] = [];
      implants.forEach((implantSent) => {
        const curatedActions
          = implantSent.actions.length > 0
            ? implantSent.actions.map((action) => {
                const data = action.toJSON();

                return {
                  action: data,
                  i18n: JSON.parse(data.i18n as string)
                };
              })
            : [];
        const curatedEffects
          = implantSent.effects.length > 0
            ? implantSent.effects.map((effect) => {
                const data = effect.toJSON();

                return {
                  effect: data,
                  i18n: JSON.parse(data.i18n as string)
                };
              })
            : [];
        const implant: any = implantSent.toJSON();
        implant.actions = curatedActions;
        implant.effects = curatedEffects;
        curatedImplants.push({
          implant,
          i18n: curateI18n(implantSent.i18n)
        });
      });

      res.send(curatedImplants);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAllStarter = (req: Request, res: Response): void => {
  findImplants({ starterKit: { $in: ['always', 'option'] } })
    .then((implants) => {
      const curatedImplants: CuratedIImplant[] = [];
      implants.forEach((implantSent) => {
        const curatedActions
          = implantSent.actions.length > 0
            ? implantSent.actions.map((action) => {
                const data = action.toJSON();

                return {
                  action: data,
                  i18n: JSON.parse(data.i18n as string)
                };
              })
            : [];
        const curatedEffects
          = implantSent.effects.length > 0
            ? implantSent.effects.map((effect) => {
                const data = effect.toJSON();

                return {
                  effect: data,
                  i18n: JSON.parse(data.i18n as string)
                };
              })
            : [];
        const implant: any = implantSent.toJSON();
        implant.actions = curatedActions;
        implant.effects = curatedEffects;
        curatedImplants.push({
          implant,
          i18n: curateI18n(implantSent.i18n)
        });
      });

      res.send(curatedImplants);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create, deleteImplant, findAll, findAllStarter, findImplantById, findSingle, update
};
