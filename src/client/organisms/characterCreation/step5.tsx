import React, {
  useCallback, useEffect, useMemo, type FC, type ReactNode
} from 'react';

import { motion } from 'framer-motion';
import {
  useForm, type SubmitHandler
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import {
  Ap, Atitle
} from '../../atoms';
import {
  Button, Checkbox
} from '../../molecules';
import {
  ArmorDisplay,
  BagDisplay,
  ImplantDisplay,
  ItemDisplay,
  ProgramDisplay,
  WeaponDisplay
} from '../index';

import type {
  IBody,
  ICharacter,
  ICuratedArmor,
  ICuratedBag,
  ICuratedImplant,
  ICuratedItem,
  ICuratedProgram,
  ICuratedWeapon
} from '../../types';

import {
  classTrim, countTrueInArray, getValuesFromGlobalValues
} from '../../utils';

import './characterCreation.scss';

interface FormValues {
  weapons: Record<string, boolean>
  armors: Record<string, boolean>
  bags: Record<string, boolean>
  items: Record<string, boolean>
  programs: Record<string, boolean>
  implants: Record<string, boolean>
}

interface ICharacterCreationStep5 {
  /** Is the form loading ? */
  loading: boolean
  /** All the available weapons to be used in character creation */
  weapons: ICuratedWeapon[]
  /** All the available programs to be used in character creation */
  programs: ICuratedProgram[]
  /** All the available items to be used in character creation */
  items: ICuratedItem[]
  /** All the available implants to be used in character creation */
  implants: ICuratedImplant[]
  /** All the available bags to be used in character creation */
  bags: ICuratedBag[]
  /** All the available armors to be used in character creation */
  armors: ICuratedArmor[]
  /** When the user click send and the data is send perfectly */
  onSubmitItems?: (items: {
    weapons: string[]
    armors: string[]
    bags: string[]
    items: string[]
    programs: string[]
    implants: string[]
    money: number
  }) => void
}

const CharacterCreationStep5: FC<ICharacterCreationStep5> = ({
  loading,
  weapons,
  programs,
  items,
  implants,
  bags,
  armors,
  onSubmitItems
}) => {
  const { t } = useTranslation();
  const {
    globalValues, character
  } = useGlobalVars();

  const createDefaultData = useCallback(
    ({
      weapons,
      armors,
      bags,
      items,
      programs,
      implants,
      character
    }: {
      weapons: ICuratedWeapon[]
      armors: ICuratedArmor[]
      bags: ICuratedBag[]
      items: ICuratedItem[]
      programs: ICuratedProgram[]
      implants: ICuratedImplant[]
      character: false | ICharacter | null
    }) => {
      if (weapons.length === 0) {
        return {};
      }
      let relevantBody: IBody | undefined;
      if (
        character !== null
        && character !== false
        && character.bodies !== undefined
      ) {
        relevantBody = character.bodies.find(body => body.alive);
      }
      const defaultData: Partial<FormValues> = {};
      weapons.forEach(({ weapon }) => {
        if (defaultData.weapons === undefined) {
          defaultData.weapons = {};
        }
        defaultData.weapons[weapon._id] = weapon.starterKit === 'always';
        if (relevantBody?.weapons?.length !== 0) {
          defaultData.weapons[weapon._id]
            = relevantBody?.weapons?.find(
              bodyWeapon => bodyWeapon.weapon === weapon._id
            ) !== undefined;
        }
      });

      armors.forEach(({ armor }) => {
        if (defaultData.armors === undefined) {
          defaultData.armors = {};
        }
        defaultData.armors[armor._id] = armor.starterKit === 'always';
        if (relevantBody?.armors?.length !== 0) {
          defaultData.armors[armor._id]
            = relevantBody?.armors?.find(
              bodyArmor => bodyArmor.armor === armor._id
            ) !== undefined;
        }
      });

      bags.forEach(({ bag }) => {
        if (defaultData.bags === undefined) {
          defaultData.bags = {};
        }
        defaultData.bags[bag._id] = bag.starterKit === 'always';
        if (relevantBody?.bags?.length !== 0) {
          defaultData.bags[bag._id]
            = relevantBody?.bags?.find(
              bodyBag => bodyBag.bag === bag._id
            ) !== undefined;
        }
      });

      items.forEach(({ item }) => {
        if (defaultData.items === undefined) {
          defaultData.items = {};
        }
        defaultData.items[item._id] = item.starterKit === 'always';
        if (relevantBody?.items?.length !== 0) {
          defaultData.items[item._id]
            = relevantBody?.items?.find(
              bodyItem => bodyItem.item === item._id
            ) !== undefined;
        }
      });

      programs.forEach(({ program }) => {
        if (defaultData.programs === undefined) {
          defaultData.programs = {};
        }
        defaultData.programs[program._id] = program.starterKit === 'always';
        if (relevantBody?.programs?.length !== 0) {
          defaultData.programs[program._id]
            = relevantBody?.programs?.find(
              bodyProgram => bodyProgram.program === program._id
            ) !== undefined;
        }
      });

      implants.forEach(({ implant }) => {
        if (defaultData.implants === undefined) {
          defaultData.implants = {};
        }
        defaultData.implants[implant._id] = implant.starterKit === 'always';
        if (relevantBody?.implants?.length !== 0) {
          defaultData.implants[implant._id]
            = relevantBody?.implants?.find(
              bodyImplant => bodyImplant.implant === implant._id
            ) !== undefined;
        }
      });

      return defaultData;
    },
    []
  );

  const {
    handleSubmit, watch, control, reset
  } = useForm<FormValues>({ defaultValues: useMemo(
    () => createDefaultData({
      weapons,
      armors,
      bags,
      items,
      programs,
      implants,
      character
    }),
    [
      createDefaultData,
      weapons,
      armors,
      bags,
      items,
      programs,
      implants,
      character
    ]
  ) });

  const {
    nbOptionnalWeaponCharCreate,
    nbOptionnalArmorCharCreate,
    nbOptionnalBagCharCreate,
    nbOptionnalItemCharCreate,
    nbOptionnalOtherCharCreate,
    starterMoney,
    starterMoneyNoItem
  } = useMemo(
    () =>
      getValuesFromGlobalValues(
        [
          'nbOptionnalWeaponCharCreate',
          'nbOptionnalArmorCharCreate',
          'nbOptionnalBagCharCreate',
          'nbOptionnalItemCharCreate',
          'nbOptionnalOtherCharCreate',
          'starterMoney',
          'starterMoneyNoItem'
        ],
        globalValues
      ),
    [globalValues]
  );

  const handleSubmitOnlyMoney = useCallback(() => {
    if (onSubmitItems !== undefined) {
      onSubmitItems({
        weapons: [],
        armors: [],
        bags: [],
        items: [],
        programs: [],
        implants: [],
        money: starterMoneyNoItem ?? 0
      });
    }
  }, [onSubmitItems, starterMoneyNoItem]);

  const onSaveItems: SubmitHandler<FormValues> = useCallback(
    ({
      weapons, armors, bags, items, programs, implants
    }) => {
      if (onSubmitItems !== undefined) {
        const weaponIds: string[] = [];
        Object.keys(weapons).forEach((weaponId) => {
          if (weapons[weaponId]) {
            weaponIds.push(weaponId);
          }
        });
        const armorIds: string[] = [];
        Object.keys(armors).forEach((armorId) => {
          if (armors[armorId]) {
            armorIds.push(armorId);
          }
        });
        const bagIds: string[] = [];
        Object.keys(bags).forEach((bagId) => {
          if (bags[bagId]) {
            bagIds.push(bagId);
          }
        });
        const itemIds: string[] = [];
        Object.keys(items).forEach((itemId) => {
          if (items[itemId]) {
            itemIds.push(itemId);
          }
        });
        const programIds: string[] = [];
        Object.keys(programs).forEach((programId) => {
          if (programs[programId]) {
            programIds.push(programId);
          }
        });
        const implantIds: string[] = [];
        Object.keys(implants).forEach((implantId) => {
          if (implants[implantId]) {
            implantIds.push(implantId);
          }
        });
        onSubmitItems({
          weapons: weaponIds,
          armors: armorIds,
          bags: bagIds,
          items: itemIds,
          programs: programIds,
          implants: implantIds,
          money: starterMoney ?? 0
        });
      }
    },
    [onSubmitItems, starterMoney]
  );

  const weaponChoices = (): ReactNode => {
    if (weapons.length === 0) {
      return null;
    }
    const included: ICuratedWeapon[] = [];
    const optionnal: ICuratedWeapon[] = [];
    weapons.forEach((weapon) => {
      if (weapon.weapon.starterKit === 'always') {
        included.push(weapon);
      } else {
        optionnal.push(weapon);
      }
    });
    const weaponSelected = watch('weapons');
    const countSelected = countTrueInArray(Object.values(weaponSelected));

    return (
      <div className="characterCreation-step5__choices__main__weapons">
        <Atitle className="characterCreation-step5__choices__main__weapons__title" level={3}>
          {t('itemTypeNames.wep', { count: nbOptionnalWeaponCharCreate })}
        </Atitle>
        <div className="characterCreation-step5__choices__main__weapons__cat">
          <Atitle level={4}>{t('characterCreation.step5.included', { ns: 'components' })}</Atitle>
          {included.map(includedWeapon => (
            <WeaponDisplay key={includedWeapon.weapon._id} weapon={includedWeapon} mode="hover" />
          ))}
        </div>
        <div className="characterCreation-step5__choices__main__weapons__cat">
          <Atitle level={4}>
            {t('characterCreation.step5.choose', {
              ns: 'components',
              qty: (nbOptionnalWeaponCharCreate ?? 0) - included.length
            })}
          </Atitle>
          {optionnal.map(optionnalWeapon => (
            <Checkbox
              inputName={`weapons.${optionnalWeapon.weapon._id}`}
              className="characterCreation-step5__choices__main__weapon-input"
              control={control}
              key={optionnalWeapon.weapon._id}
              label={<WeaponDisplay weapon={optionnalWeapon} mode="hover" />}
              disabled={
                countSelected >= (nbOptionnalWeaponCharCreate ?? 0)
                && !weaponSelected[optionnalWeapon.weapon._id]
              }
            />
          ))}
        </div>
      </div>
    );
  };

  const armorChoices = (): ReactNode => {
    if (armors.length === 0) {
      return null;
    }
    const included: ICuratedArmor[] = [];
    const optionnal: ICuratedArmor[] = [];
    const armorSelected = watch('armors');
    const countSelected = countTrueInArray(Object.values(armorSelected));
    armors.forEach((armor) => {
      if (armor.armor.starterKit === 'always') {
        included.push(armor);
      } else {
        optionnal.push(armor);
      }
    });

    return (
      <div className="characterCreation-step5__choices__main__armors">
        <Atitle className="characterCreation-step5__choices__main__armors__title" level={3}>
          {t('itemTypeNames.shi', { count: nbOptionnalArmorCharCreate })}
        </Atitle>
        {included.length > 0
          ? (
              <div className="characterCreation-step5__choices__main__armors__cat">
                <Atitle level={4}>{t('characterCreation.step5.included', { ns: 'components' })}</Atitle>
                {included.map(includedArmor => (
                  <ArmorDisplay key={includedArmor.armor._id} armor={includedArmor} mode="hover" />
                ))}
              </div>
            )
          : null}

        {optionnal.length > 0
          ? (
              <div className="characterCreation-step5__choices__main__armors__cat">
                <Atitle level={4}>
                  {t('characterCreation.step5.choose', {
                    ns: 'components',
                    qty: (nbOptionnalArmorCharCreate ?? 0) - included.length
                  })}
                </Atitle>
                {optionnal.map(optionnalArmor => (
                  <Checkbox
                    inputName={`armors.${optionnalArmor.armor._id}`}
                    className="characterCreation-step5__choices__main__armor-input"
                    control={control}
                    key={optionnalArmor.armor._id}
                    disabled={
                      countSelected >= (nbOptionnalArmorCharCreate ?? 0)
                      && !armorSelected[optionnalArmor.armor._id]
                    }
                    label={<ArmorDisplay armor={optionnalArmor} mode="hover" />}
                  />
                ))}
              </div>
            )
          : null}
      </div>
    );
  };

  const bagChoices = (): ReactNode => {
    if (bags.length === 0) {
      return null;
    }
    const included: ICuratedBag[] = [];
    const optionnal: ICuratedBag[] = [];
    const bagSelected = watch('bags');
    const countSelected = countTrueInArray(Object.values(bagSelected));
    bags.forEach((bag) => {
      if (bag.bag.starterKit === 'always') {
        included.push(bag);
      } else {
        optionnal.push(bag);
      }
    });

    return (
      <div className="characterCreation-step5__choices__main__bags">
        <Atitle className="characterCreation-step5__choices__main__bags__title" level={3}>
          {t('itemTypeNames.bag', { count: nbOptionnalBagCharCreate })}
        </Atitle>
        {included.length > 0
          ? (
              <div className="characterCreation-step5__choices__main__bags__cat">
                <Atitle level={4}>{t('characterCreation.step5.included', { ns: 'components' })}</Atitle>
                {included.map(includedBag => (
                  <BagDisplay key={includedBag.bag._id} bag={includedBag} mode="hover" />
                ))}
              </div>
            )
          : null}

        {optionnal.length > 0
          ? (
              <div className="characterCreation-step5__choices__main__bags__cat">
                <Atitle level={4}>
                  {t('characterCreation.step5.choose', {
                    ns: 'components',
                    qty: (nbOptionnalBagCharCreate ?? 0) - included.length
                  })}
                </Atitle>
                {optionnal.map(optionnalBag => (
                  <Checkbox
                    inputName={`bags.${optionnalBag.bag._id}`}
                    className="characterCreation-step5__choices__main__bag-input"
                    control={control}
                    key={optionnalBag.bag._id}
                    disabled={
                      countSelected >= (nbOptionnalBagCharCreate ?? 0)
                      && !bagSelected[optionnalBag.bag._id]
                    }
                    label={<BagDisplay bag={optionnalBag} mode="hover" />}
                  />
                ))}
              </div>
            )
          : null}
      </div>
    );
  };

  const itemChoices = (): ReactNode => {
    if (items.length === 0) {
      return null;
    }
    const included: ICuratedItem[] = [];
    const optionnal: ICuratedItem[] = [];
    const itemSelected = watch('items');
    const countSelected = countTrueInArray(Object.values(itemSelected));
    items.forEach((item) => {
      if (item.item.starterKit === 'always') {
        included.push(item);
      } else {
        optionnal.push(item);
      }
    });

    return (
      <div className="characterCreation-step5__choices__main__items">
        <Atitle className="characterCreation-step5__choices__main__items__title" level={3}>
          {t('itemTypeNames.itm', { count: nbOptionnalItemCharCreate })}
        </Atitle>
        {included.length > 0
          ? (
              <div className="characterCreation-step5__choices__main__items__cat">
                <Atitle level={4}>{t('characterCreation.step5.included', { ns: 'components' })}</Atitle>
                {included.map(includedItem => (
                  <ItemDisplay key={includedItem.item._id} item={includedItem} mode="hover" />
                ))}
              </div>
            )
          : null}

        {optionnal.length > 0
          ? (
              <div className="characterCreation-step5__choices__main__items__cat">
                <Atitle level={4}>
                  {t('characterCreation.step5.choose', {
                    ns: 'components',
                    qty: (nbOptionnalItemCharCreate ?? 0) - included.length
                  })}
                </Atitle>
                {optionnal.map(optionnalItem => (
                  <Checkbox
                    inputName={`items.${optionnalItem.item._id}`}
                    className="characterCreation-step5__choices__main__item-input"
                    control={control}
                    key={optionnalItem.item._id}
                    disabled={
                      countSelected >= (nbOptionnalItemCharCreate ?? 0)
                      && !itemSelected[optionnalItem.item._id]
                    }
                    label={<ItemDisplay item={optionnalItem} mode="hover" />}
                  />
                ))}
              </div>
            )
          : null}
      </div>
    );
  };

  const specializedChoices = (): ReactNode => {
    if (items.length === 0) {
      return null;
    }
    const optionnalPrograms: ICuratedProgram[] = [];
    const optionnalImplants: ICuratedImplant[] = [];
    const programSelected = watch('programs');
    const implantSelected = watch('implants');
    const countSelected
      = countTrueInArray(Object.values(programSelected))
        + countTrueInArray(Object.values(implantSelected));
    programs.forEach((program) => {
      if (program.program.starterKit !== 'always') {
        optionnalPrograms.push(program);
      }
    });
    implants.forEach((implant) => {
      if (implant.implant.starterKit !== 'always') {
        optionnalImplants.push(implant);
      }
    });

    return (
      <div className="characterCreation-step5__choices__main__specialized">
        <Atitle className="characterCreation-step5__choices__main__specialized__title" level={3}>
          {t('itemTypeNames.spe')}
        </Atitle>
        <Atitle level={4}>
          {t('characterCreation.step5.choose', {
            ns: 'components',
            qty: nbOptionnalOtherCharCreate
          })}
        </Atitle>
        {optionnalPrograms.length > 0
          ? (
              <div className="characterCreation-step5__choices__main__specialized__cat">
                <Atitle level={4}>{t('itemTypeNames.pro', { count: optionnalPrograms.length })}</Atitle>
                {optionnalPrograms.map(optionnalProgram => (
                  <Checkbox
                    inputName={`programs.${optionnalProgram.program._id}`}
                    className="characterCreation-step5__choices__main__specialized-input"
                    control={control}
                    key={optionnalProgram.program._id}
                    disabled={
                      countSelected >= (nbOptionnalOtherCharCreate ?? 0)
                      && !programSelected[optionnalProgram.program._id]
                    }
                    label={<ProgramDisplay program={optionnalProgram} mode="hover" />}
                  />
                ))}
              </div>
            )
          : null}
        {optionnalImplants.length > 0
          ? (
              <div className="characterCreation-step5__choices__main__specialized__cat">
                <Atitle level={4}>{t('itemTypeNames.imp', { count: optionnalImplants.length })}</Atitle>
                {optionnalImplants.map(optionnalImplant => (
                  <Checkbox
                    inputName={`implants.${optionnalImplant.implant._id}`}
                    className="characterCreation-step5__choices__main__specialized-input"
                    control={control}
                    key={optionnalImplant.implant._id}
                    disabled={
                      countSelected >= (nbOptionnalOtherCharCreate ?? 0)
                      && !implantSelected[optionnalImplant.implant._id]
                    }
                    label={<ImplantDisplay implant={optionnalImplant} mode="hover" />}
                  />
                ))}
              </div>
            )
          : null}
      </div>
    );
  };

  const elts: FormValues = watch();
  let canSubmitList = false;
  const nbChosenArmors = countTrueInArray(Object.values(elts.armors));
  const nbChosenPrograms = countTrueInArray(
    Object.values(elts.programs)
  );
  const nbChosenItems = countTrueInArray(Object.values(elts.items));
  const nbChosenImplants = countTrueInArray(
    Object.values(elts.implants)
  );
  const nbChosenBags = countTrueInArray(Object.values(elts.bags));
  const nbChosenWeapons = countTrueInArray(Object.values(elts.weapons));

  canSubmitList
      = nbChosenArmors === nbOptionnalArmorCharCreate
        && nbChosenPrograms + nbChosenImplants === nbOptionnalOtherCharCreate
        && nbChosenItems === nbOptionnalItemCharCreate
        && nbChosenBags === nbOptionnalBagCharCreate
        && nbChosenWeapons === nbOptionnalWeaponCharCreate;

  useEffect(() => {
    reset(createDefaultData({
      weapons,
      armors,
      bags,
      items,
      programs,
      implants,
      character
    }));
  }, [
    character,
    reset,
    createDefaultData,
    weapons,
    armors,
    bags,
    items,
    programs,
    implants
  ]);

  return (
    <motion.div
      className={classTrim(`
        characterCreation-step5
      `)}
      initial={{ transform: 'skew(90deg, 0deg) scale3d(.2, .2, .2)' }}
      animate={{
        transform: 'skew(0, 0) scale3d(1, 1, 1)',
        transitionEnd: { transform: 'none' }
      }}
      exit={{ transform: 'skew(-90deg, 0deg) scale3d(.2, .2, .2)' }}
      transition={{
        ease: 'easeInOut', duration: 0.2
      }}
    >
      <Ap className="characterCreation-step5__text">
        {t('characterCreation.step5.text', { ns: 'components' })}
      </Ap>
      <Ap className="characterCreation-step5__sub">
        {t('characterCreation.step5.sub', { ns: 'components' })}
      </Ap>
      <div className="characterCreation-step5__choices">
        <div className="characterCreation-step5__choices__main">
          <Atitle className="characterCreation-step5__choices__main__title" level={2}>
            {t('characterCreation.step5.main', { ns: 'components' })}
          </Atitle>
          <form
            className="characterCreation-step5__choices__form"
            onSubmit={(evt) => {
              void handleSubmit(onSaveItems)(evt);
            }}
            noValidate
          >
            <div className="characterCreation-step5__choices__main__blocks">
              {weaponChoices()}
              {armorChoices()}
              {bagChoices()}
              {itemChoices()}
              {specializedChoices()}
            </div>
            <div className="characterCreation-step5__choices__main__btns">
              <Button
                type="submit"
                size="large"
                className="characterCreation-step2__choices__btn"
                disabled={!canSubmitList || loading}
                theme={!canSubmitList || loading ? 'text-only' : 'afterglow'}
              >
                {t('characterCreation.step5.next', {
                  ns: 'components', money: starterMoney
                })}
              </Button>
              <Ap className="characterCreation-step5__choices__main__btns__or">
                {t('characterCreation.step5.or', { ns: 'components' })}
              </Ap>
              <Button
                size="large"
                theme={loading ? 'text-only' : 'afterglow'}
                className="characterCreation-step2__choices__btn"
                onClick={handleSubmitOnlyMoney}
                disabled={loading}
              >
                {t('characterCreation.step5.nextOnlyCash', {
                  ns: 'components',
                  money: starterMoneyNoItem
                })}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default CharacterCreationStep5;
