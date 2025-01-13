import type { Request, Response } from 'express';
import type { ObjectId } from 'mongoose';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { smartUpdateActions } from '../action/controller';
import { curateDamageIds } from '../damage/controller';
import { smartUpdateEffects } from '../effect/controller';

import type { IDamage } from '../damage/model';
import type { IAction, IEffect } from '../index';
import type { HydratedIWeapon } from './model';

import { curateI18n } from '../../utils';

const { Weapon } = db;

interface findAllPayload {
  starterKit?: string | Record<string, string[]>
}

const findWeapons = async (options?: findAllPayload): Promise<HydratedIWeapon[]> =>
  await new Promise((resolve, reject) => {
    Weapon.find(options ?? {})
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: IAction[] }>('actions')
      .populate<{ damages: IDamage[] }>('damages')
      .then(async (res?: HydratedIWeapon[] | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Weapons'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err: unknown) => {
        reject(err);
      });
  });

const findWeaponById = async (id: string): Promise<HydratedIWeapon> =>
  await new Promise((resolve, reject) => {
    Weapon.findById(id)
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: IAction[] }>('actions')
      .populate<{ damages: IDamage[] }>('damages')
      .then(async (res?: HydratedIWeapon | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Weapon'));
        } else {
          resolve(res);
        }
      })
      .catch(async (err: unknown) => {
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
  } = req.body;
  if (
    title === undefined
    || summary === undefined
    || weaponType === undefined
    || rarity === undefined
    || weaponScope === undefined
    || cost === undefined
  ) {
    res.status(400).send(gemInvalidField('Weapon'));

    return;
  }

  const weapon = new Weapon({
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
    damagesToAdd: damages as Array<{
      damageType: string
      dices: string
    }>
  })
    .then((damageIds) => {
      if (damageIds.length > 0) {
        weapon.damages = damageIds.map(damageId => String(damageId));
      }
      smartUpdateEffects({
        effectsToRemove: [],
        effectsToUpdate: effects
      })
        .then((effectsIds) => {
          if (effectsIds.length > 0) {
            weapon.effects = effectsIds.map(effectsId => String(effectsId));
          }
          smartUpdateActions({
            actionsToRemove: [],
            actionsToUpdate: actions
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
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Weapon ID'));

    return;
  }

  findWeaponById(id as string)
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
      interface IDamageElt extends IDamage {
        _id: ObjectId
      }
      const damagesToRemove = weapon.damages.reduce((result: string[], elt: IDamageElt) => {
        const foundDamage = damages.find(
          damage => damage.damageType === String(elt.damageType) && damage.dices === elt.dices
        );
        if (foundDamage === undefined) {
          result.push(String(elt._id));
        } else {
          damagesToStay.push(String(elt._id));
        }

        return result;
      }, []);

      const damagesToAdd = damages.reduce(
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

      interface IEffectElt extends IEffect {
        _id: ObjectId
      }
      const effectsToRemove = weapon.effects.reduce((result: string[], elt: IEffectElt) => {
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
      const actionsToRemove = weapon.actions.reduce((result: string[], elt: IActionElt) => {
        const foundAction = actions.find(
          action => action.id !== undefined && String(action.id) === String(elt._id)
        );
        if (foundAction === undefined) {
          result.push(String(elt._id));
        }

        return result;
      }, []);

      if (i18n !== null) {
        const newIntl = {
          ...(weapon.i18n !== null && weapon.i18n !== undefined && weapon.i18n !== ''
            ? JSON.parse(weapon.i18n)
            : {})
        };

        Object.keys(i18n as Record<string, any>).forEach((lang) => {
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
            weapon.damages = damageIds.map(skillBonusId => String(skillBonusId));
          } else if (damageIds !== null && damageIds.length === 0) {
            weapon.damages = [];
          }
          smartUpdateEffects({
            effectsToRemove,
            effectsToUpdate: effects
          })
            .then((effectsIds) => {
              if (effectsIds.length > 0) {
                weapon.effects = effectsIds.map(effectsId => String(effectsId));
              }
              smartUpdateActions({
                actionsToRemove,
                actionsToUpdate: actions
              })
                .then((actionsIds) => {
                  if (actionsIds.length > 0) {
                    weapon.actions = actionsIds.map(actionsId => String(actionsId));
                  }
                  weapon
                    .save()
                    .then(() => {
                      res.send({ message: 'Weapon was updated successfully!', weapon });
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

const deleteWeaponById = async (id: string): Promise<boolean> =>
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
  const { id } = req.body;

  findWeaponById(id as string)
    .then((weapon) => {
      const damagesToRemove = weapon.damages.map(elt => elt._id);
      const effectsToRemove = weapon.effects.map(elt => elt._id);
      const actionsToRemove = weapon.actions.map(elt => elt._id);

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
                  deleteWeaponById(id as string)
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

interface CuratedIWeapon {
  i18n: Record<string, unknown>
  weapon: any
}

const findSingle = (req: Request, res: Response): void => {
  const { weaponId } = req.query;
  if (weaponId === undefined || typeof weaponId !== 'string') {
    res.status(400).send(gemInvalidField('Weapon ID'));

    return;
  }
  findWeaponById(weaponId)
    .then((weaponSent) => {
      const curatedActions
        = weaponSent.actions.length > 0
          ? weaponSent.actions.map((action) => {
              const data = action.toJSON();

              return {
                ...data,
                ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {})
              };
            })
          : [];
      const curatedEffects
        = weaponSent.effects.length > 0
          ? weaponSent.effects.map((effect) => {
              const data = effect.toJSON();

              return {
                ...data,
                ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {})
              };
            })
          : [];
      const weapon = weaponSent.toJSON();
      weapon.actions = curatedActions;
      weapon.effects = curatedEffects;
      const sentObj = {
        weapon,
        i18n: curateI18n(weaponSent.i18n)
      };
      res.send(sentObj);
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findWeapons()
    .then((weapons) => {
      const curatedWeapons: CuratedIWeapon[] = [];
      weapons.forEach((weaponSent) => {
        const curatedActions
          = weaponSent.actions.length > 0
            ? weaponSent.actions.map((action) => {
                const data = action.toJSON();

                return {
                  ...data,
                  ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {})
                };
              })
            : [];
        const curatedEffects
          = weaponSent.effects.length > 0
            ? weaponSent.effects.map((effect) => {
                const data = effect.toJSON();

                return {
                  ...data,
                  ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {})
                };
              })
            : [];
        const weapon = weaponSent.toJSON();
        weapon.actions = curatedActions;
        weapon.effects = curatedEffects;
        curatedWeapons.push({
          weapon,
          i18n: curateI18n(weaponSent.i18n)
        });
      });

      res.send(curatedWeapons);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAllStarter = (req: Request, res: Response): void => {
  findWeapons({ starterKit: { $in: ['always', 'option'] } })
    .then((weapons) => {
      const curatedWeapons: CuratedIWeapon[] = [];
      weapons.forEach((weaponSent) => {
        const curatedActions
          = weaponSent.actions.length > 0
            ? weaponSent.actions.map((action) => {
                const data = action.toJSON();

                return {
                  ...data,
                  ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {})
                };
              })
            : [];
        const curatedEffects
          = weaponSent.effects.length > 0
            ? weaponSent.effects.map((effect) => {
                const data = effect.toJSON();

                return {
                  ...data,
                  ...(data.i18n !== undefined ? { i18n: JSON.parse(data.i18n as string) } : {})
                };
              })
            : [];
        const weapon = weaponSent.toJSON();
        weapon.actions = curatedActions;
        weapon.effects = curatedEffects;
        curatedWeapons.push({
          weapon,
          i18n: curateI18n(weaponSent.i18n)
        });
      });

      res.send(curatedWeapons);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export { create, deleteWeapon, findAll, findAllStarter, findSingle, findWeaponById, update };
