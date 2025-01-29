import type {
  Request, Response
} from 'express';
import type { ObjectId } from 'mongoose';

import db from '../../models';
import {
  gemInvalidField, gemNotFound, gemServerError
} from '../../utils/globalErrorMessage';
import { type ISentAction, smartUpdateActions } from '../action/controller';
import { curateDamageIds } from '../damage/controller';
import { type ISentEffect, smartUpdateEffects } from '../effect/controller';

import type {
  InternationalizationType
} from '../../utils/types';
import type {
  HydratedIAction,
  HydratedIEffect,
  HydratedIDamage,
  IEffect,
  IAction,
  IDamage
} from '../index';
import type { HydratedIWeapon, LeanIWeapon } from './model';

import { curateI18n } from '../../utils';

const { Weapon } = db;

interface findAllPayload {
  starterKit?: string | Record<string, string[]>
}

const findWeapons
  = async (options?: findAllPayload): Promise<LeanIWeapon[]> =>
    await new Promise((resolve, reject) => {
      Weapon.find(options ?? {})
        .lean()
        .populate<{ effects: IEffect[] }>('effects')
        .populate<{ actions: IAction[] }>('actions')
        .populate<{ damages: IDamage[] }>('damages')
        .then((res: LeanIWeapon[]) => {
          if (res.length === 0) {
            reject(gemNotFound('Weapons'));
          } else {
            resolve(res);
          }
        })
        .catch((err: unknown) => {
          reject(err);
        });
    });

const findCompleteWeaponById = async (id: string): Promise<HydratedIWeapon> =>
  await new Promise((resolve, reject) => {
    Weapon.findById(id)
      .populate<{ effects: HydratedIEffect[] }>('effects')
      .populate<{ actions: HydratedIAction[] }>('actions')
      .populate<{ damages: HydratedIDamage[] }>('damages')
      .then((res?: HydratedIWeapon | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Weapon'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findWeaponById = async (id: string): Promise<LeanIWeapon> =>
  await new Promise((resolve, reject) => {
    Weapon.findById(id)
      .lean()
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: IAction[] }>('actions')
      .populate<{ damages: IDamage[] }>('damages')
      .then((res?: LeanIWeapon | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Weapon'));
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
    quote,
    i18n = null,
    weaponType,
    rarity,
    weaponScope,
    itemModifiers,
    starterKit,
    cost,
    magasine,
    ammoPerShot,
    effects,
    actions,
    damages
  }: {
    title?: string
    summary?: string
    quote?: string
    i18n?: InternationalizationType | null
    weaponType?: ObjectId
    rarity?: ObjectId
    weaponScope?: ObjectId
    itemModifiers?: ObjectId[]
    starterKit?: string
    cost?: number
    magasine?: number
    ammoPerShot?: number
    effects?: ISentEffect[]
    actions?: ISentAction[]
    damages?: Array<{
      damageType: string
      dices: string
    }>
  } = req.body;
  if (
    title === undefined
    || summary === undefined
    || weaponType === undefined
    || rarity === undefined
    || weaponScope === undefined
    || cost === undefined
    || damages === undefined
  ) {
    res.status(400).send(gemInvalidField('Weapon'));

    return;
  }

  const weapon: HydratedIWeapon = new Weapon({
    title,
    summary,
    quote,
    weaponType,
    rarity,
    weaponScope,
    cost,
    magasine,
    ammoPerShot,
    itemModifiers,
    starterKit
  });

  if (i18n !== null) {
    weapon.i18n = JSON.stringify(i18n);
  }

  curateDamageIds({
    damagesToRemove: [],
    damagesToStay: [],
    damagesToAdd: damages
  })
    .then((damageIds) => {
      if (damageIds.length > 0) {
        weapon.damages = damageIds.map(damageId => String(damageId));
      }
      smartUpdateEffects({
        effectsToRemove: [],
        effectsToUpdate: effects ?? []
      })
        .then((effectsIds) => {
          if (effectsIds.length > 0) {
            weapon.effects = effectsIds.map(effectsId => String(effectsId));
          }
          smartUpdateActions({
            actionsToRemove: [],
            actionsToUpdate: actions ?? []
          })
            .then((actionsIds) => {
              if (actionsIds.length > 0) {
                weapon.actions = actionsIds.map(actionsId => String(actionsId));
              }
              weapon
                .save()
                .then(() => {
                  res.send(weapon);
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
    quote = null,
    i18n,
    weaponType = null,
    rarity = null,
    weaponScope = null,
    itemModifiers = null,
    cost = null,
    magasine = null,
    ammoPerShot = null,
    starterKit = null,
    effects = null,
    actions = null,
    damages = null
  }: {
    id?: string
    title: string | null
    summary: string | null
    quote: string | null
    i18n: InternationalizationType | null
    weaponType: string | null
    rarity: string | null
    weaponScope: string | null
    itemModifiers: string[] | null
    starterKit: 'always' | 'never' | 'option' | null
    cost: number | null
    magasine: number | null
    ammoPerShot: number | null
    effects: ISentEffect[] | null
    actions: ISentAction[] | null
    damages: Array<{
      damageType: string
      dices: string
    }> | null
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Weapon ID'));

    return;
  }

  findCompleteWeaponById(id)
    .then((weapon) => {
      if (title !== null) {
        weapon.title = title;
      }
      if (weaponType !== null) {
        weapon.weaponType = weaponType;
      }
      if (summary !== null) {
        weapon.summary = summary;
      }
      if (quote !== null) {
        weapon.quote = quote;
      }
      if (rarity !== null) {
        weapon.rarity = rarity;
      }
      if (weaponScope !== null) {
        weapon.weaponScope = weaponScope;
      }
      if (starterKit !== null) {
        weapon.starterKit = starterKit;
      }
      if (itemModifiers !== null) {
        weapon.itemModifiers = itemModifiers;
      }
      if (cost !== null) {
        weapon.cost = cost;
      }
      if (magasine !== null) {
        weapon.magasine = magasine;
      }
      if (ammoPerShot !== null) {
        weapon.ammoPerShot = ammoPerShot;
      }

      const damagesToStay: string[] = [];
      let damagesToRemove: string[] = [];
      let damagesToAdd: Array<{
        damageType: string
        dices: string
      }> = [];

      if (damages !== null) {
        damagesToRemove = weapon.damages.reduce(
          (result: string[], elt: HydratedIDamage) => {
            const foundDamage = damages.find(
              damage => damage.damageType === String(elt.damageType)
                && damage.dices === elt.dices
            );
            if (foundDamage === undefined) {
              result.push(String(elt._id));
            } else {
              damagesToStay.push(String(elt._id));
            }

            return result;
          }, []
        );

        damagesToAdd = damages.reduce(
          (
            result: Array<{
              damageType: string
              dices: string
            }>,
            elt: {
              damageType: string
              dices: string
            }
          ) => {
            const foundDamage = weapon.damages.find(
              damage =>
                typeof damage !== 'string'
                && String(damage.damageType) === elt.damageType
                && damage.dices === elt.dices
            );
            if (foundDamage === undefined) {
              result.push(elt);
            }

            return result;
          },
          []
        );
      }

      let effectsToRemove: string[] = [];

      if (effects !== null) {
        effectsToRemove = weapon.effects.reduce(
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
        actionsToRemove = weapon.actions.reduce(
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
          weapon.i18n !== undefined
          && weapon.i18n !== ''
            ? JSON.parse(weapon.i18n)
            : {}
        ) };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        weapon.i18n = JSON.stringify(newIntl);
      }

      curateDamageIds({
        damagesToRemove,
        damagesToAdd,
        damagesToStay
      })
        .then((damageIds) => {
          if (damageIds.length > 0) {
            weapon.damages = damageIds.map(
              skillBonusId => String(skillBonusId));
          } else if (damageIds.length === 0) {
            weapon.damages = [];
          }
          smartUpdateEffects({
            effectsToRemove,
            effectsToUpdate: effects ?? []
          })
            .then((effectsIds) => {
              if (effectsIds.length > 0) {
                weapon.effects = effectsIds.map(effectsId => String(effectsId));
              }
              smartUpdateActions({
                actionsToRemove,
                actionsToUpdate: actions ?? []
              })
                .then((actionsIds) => {
                  if (actionsIds.length > 0) {
                    weapon.actions = actionsIds.map(
                      actionsId => String(actionsId));
                  }
                  weapon
                    .save()
                    .then(() => {
                      res.send({
                        message: 'Weapon was updated successfully!', weapon
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
      res.status(404).send(gemNotFound('Weapon'));
    });
};

const deleteWeaponById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Weapon ID'));

      return;
    }
    Weapon.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteWeapon = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;

  findCompleteWeaponById(id)
    .then((weapon: Omit<HydratedIWeapon, 'effects' | 'actions' | 'damages'> & {
      effects: HydratedIEffect[]
      actions: HydratedIAction[]
      damages: HydratedIDamage[]
    }) => {
      const damagesToRemove = weapon.damages.map(elt => String(elt._id));
      const effectsToRemove = weapon.effects.map(elt => String(elt._id));
      const actionsToRemove = weapon.actions.map(elt => String(elt._id));

      curateDamageIds({
        damagesToRemove,
        damagesToAdd: [],
        damagesToStay: []
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
                  deleteWeaponById(id)
                    .then(() => {
                      res.send({ message: 'Weapon was deleted successfully!' });
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
      res.status(404).send(gemNotFound('Weapon'));
    });
};

export interface CuratedIWeaponToSend {
  weapon: Omit<
    LeanIWeapon
    , 'effects' | 'actions' | 'damages'
  > & {
    damages: IDamage[]
    effects: Array<{
      effect: IEffect
      i18n?: InternationalizationType
    }>
    actions: Array<{
      action: IAction
      i18n?: InternationalizationType
    }>
  }
  i18n?: InternationalizationType
}

export const curateSingleWeapon = (
  weaponSent: LeanIWeapon
): CuratedIWeaponToSend => {
  const curatedActions
    = weaponSent.actions.length > 0
      ? weaponSent.actions.map(action => ({
          action,
          i18n: curateI18n(action.i18n)
        }))
      : [];
  const curatedEffects
    = weaponSent.effects.length > 0
      ? weaponSent.effects.map(effect => ({
          effect,
          i18n: curateI18n(effect.i18n)
        }))
      : [];

  return {
    weapon: {
      ...weaponSent,
      actions: curatedActions,
      effects: curatedEffects
    },
    i18n: curateI18n(weaponSent.i18n)
  };
};

const findSingle = (req: Request, res: Response): void => {
  const { weaponId } = req.query;
  if (weaponId === undefined || typeof weaponId !== 'string') {
    res.status(400).send(gemInvalidField('Weapon ID'));

    return;
  }
  findWeaponById(weaponId)
    .then((weaponSent) => {
      res.send(curateSingleWeapon(weaponSent));
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findWeapons()
    .then((weapons) => {
      const curatedWeapons: CuratedIWeaponToSend[] = [];
      weapons.forEach((weaponSent) => {
        curatedWeapons.push(curateSingleWeapon(weaponSent));
      });

      res.send(curatedWeapons);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAllStarter = (req: Request, res: Response): void => {
  findWeapons({ starterKit: { $in: ['always', 'option'] } })
    .then((weapons) => {
      const curatedWeapons: CuratedIWeaponToSend[] = [];
      weapons.forEach((weaponSent) => {
        curatedWeapons.push(curateSingleWeapon(weaponSent));
      });

      res.send(curatedWeapons);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  deleteWeapon,
  findAll,
  findAllStarter,
  findSingle,
  findWeaponById,
  update
};
