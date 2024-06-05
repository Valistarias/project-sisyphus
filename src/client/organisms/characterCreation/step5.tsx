import React, { useCallback, useMemo, type FC, type ReactNode } from 'react';

import { motion } from 'framer-motion';
import { useForm, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ap, Atitle } from '../../atoms';
import { Checkbox } from '../../molecules';
import {
  type ICuratedArmor,
  type ICuratedBag,
  type ICuratedImplant,
  type ICuratedItem,
  type ICuratedProgram,
  type ICuratedWeapon,
} from '../../types';
import {
  ArmorDisplay,
  BagDisplay,
  ImplantDisplay,
  ItemDisplay,
  ProgramDisplay,
  WeaponDisplay,
} from '../index';

import { classTrim } from '../../utils';

import './characterCreation.scss';

interface FormValues {
  weapons: Record<string, boolean>;
  armors: Record<string, boolean>;
  bags: Record<string, boolean>;
  items: Record<string, boolean>;
  programs: Record<string, boolean>;
  implants: Record<string, boolean>;
}

interface ICharacterCreationStep5 {
  /** All the available weapons to be used in character creation */
  weapons: ICuratedWeapon[];
  /** All the available programs to be used in character creation */
  programs: ICuratedProgram[];
  /** All the available items to be used in character creation */
  items: ICuratedItem[];
  /** All the available implants to be used in character creation */
  implants: ICuratedImplant[];
  /** All the available bags to be used in character creation */
  bags: ICuratedBag[];
  /** All the available armors to be used in character creation */
  armors: ICuratedArmor[];
  /** When the user click send and the data is send perfectly */
  onSubmitItems: () => void;
}

const CharacterCreationStep5: FC<ICharacterCreationStep5> = ({
  weapons,
  programs,
  items,
  implants,
  bags,
  armors,
  onSubmitItems,
}) => {
  const { t } = useTranslation();
  const { globalValues } = useGlobalVars();

  const createDefaultData = useCallback(
    (
      weapons: ICuratedWeapon[],
      armors: ICuratedArmor[],
      bags: ICuratedBag[],
      items: ICuratedItem[],
      programs: ICuratedProgram[],
      implants: ICuratedImplant[]
    ) => {
      if (weapons.length === 0) {
        return {};
      }
      const defaultData: Partial<FormValues> = {};
      weapons.forEach(({ weapon }) => {
        if (defaultData.weapons === undefined) {
          defaultData.weapons = {};
        }
        defaultData.weapons[weapon._id] = weapon.starterKit === 'always';
      });

      armors.forEach(({ armor }) => {
        if (defaultData.armors === undefined) {
          defaultData.armors = {};
        }
        defaultData.armors[armor._id] = armor.starterKit === 'always';
      });

      bags.forEach(({ bag }) => {
        if (defaultData.bags === undefined) {
          defaultData.bags = {};
        }
        defaultData.bags[bag._id] = bag.starterKit === 'always';
      });

      items.forEach(({ item }) => {
        if (defaultData.items === undefined) {
          defaultData.items = {};
        }
        defaultData.items[item._id] = item.starterKit === 'always';
      });

      programs.forEach(({ program }) => {
        if (defaultData.programs === undefined) {
          defaultData.programs = {};
        }
        defaultData.programs[program._id] = program.starterKit === 'always';
      });

      implants.forEach(({ implant }) => {
        if (defaultData.implants === undefined) {
          defaultData.implants = {};
        }
        defaultData.implants[implant._id] = implant.starterKit === 'always';
      });

      return defaultData;
    },
    []
  );

  const { handleSubmit, watch, control } = useForm<FieldValues>({
    defaultValues: useMemo(
      () => createDefaultData(weapons, armors, bags, items, programs, implants),
      [createDefaultData, weapons, armors, bags, items, programs, implants]
    ),
  });

  const {
    nbOptionnalWeaponCharCreate,
    nbOptionnalArmorCharCreate,
    nbOptionnalBagCharCreate,
    nbOptionnalItemCharCreate,
    nbOptionnalOtherCharCreate,
  } = useMemo(
    () => ({
      nbOptionnalWeaponCharCreate: Number(
        globalValues.find(({ name }) => name === 'nbOptionnalWeaponCharCreate')?.value ?? 0
      ),
      nbOptionnalArmorCharCreate: Number(
        globalValues.find(({ name }) => name === 'nbOptionnalArmorCharCreate')?.value ?? 0
      ),
      nbOptionnalBagCharCreate: Number(
        globalValues.find(({ name }) => name === 'nbOptionnalBagCharCreate')?.value ?? 0
      ),
      nbOptionnalItemCharCreate: Number(
        globalValues.find(({ name }) => name === 'nbOptionnalItemCharCreate')?.value ?? 0
      ),
      nbOptionnalOtherCharCreate: Number(
        globalValues.find(({ name }) => name === 'nbOptionnalOtherCharCreate')?.value ?? 0
      ),
    }),
    [globalValues]
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
    let countSelected = 0;
    Object.values(weaponSelected as Record<string, boolean>).forEach((isIncluded) => {
      if (isIncluded) {
        countSelected += 1;
      }
    });
    return (
      <div className="characterCreation-step5__choices__main__weapons">
        <Atitle className="characterCreation-step5__choices__main__weapons__title" level={3}>
          {t('itemTypeNames.wep', { count: included.length + nbOptionnalWeaponCharCreate })}
        </Atitle>
        <div className="characterCreation-step5__choices__main__weapons__cat">
          <Atitle level={4}>{t('characterCreation.step5.included', { ns: 'components' })}</Atitle>
          {included.map((includedWeapon) => (
            <WeaponDisplay key={includedWeapon.weapon._id} weapon={includedWeapon} mode="hover" />
          ))}
        </div>
        <div className="characterCreation-step5__choices__main__weapons__cat">
          <Atitle level={4}>
            {t('characterCreation.step5.choose', {
              ns: 'components',
              qty: nbOptionnalWeaponCharCreate,
            })}
          </Atitle>
          {optionnal.map((optionnalWeapon) => (
            <Checkbox
              inputName={`weapons.${optionnalWeapon.weapon._id}`}
              className="characterCreation-step5__choices__main__weapon-input"
              control={control}
              key={optionnalWeapon.weapon._id}
              label={<WeaponDisplay weapon={optionnalWeapon} mode="hover" />}
              disabled={
                countSelected - included.length >= nbOptionnalWeaponCharCreate &&
                weaponSelected[optionnalWeapon.weapon._id] === false
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
    let countSelected = 0;
    Object.values(armorSelected as Record<string, boolean>).forEach((isIncluded) => {
      if (isIncluded) {
        countSelected += 1;
      }
    });
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
          {t('itemTypeNames.shi', { count: included.length + nbOptionnalArmorCharCreate })}
        </Atitle>
        {included.length > 0 ? (
          <div className="characterCreation-step5__choices__main__armors__cat">
            <Atitle level={4}>{t('characterCreation.step5.included', { ns: 'components' })}</Atitle>
            {included.map((includedArmor) => (
              <ArmorDisplay key={includedArmor.armor._id} armor={includedArmor} mode="hover" />
            ))}
          </div>
        ) : null}

        {optionnal.length > 0 ? (
          <div className="characterCreation-step5__choices__main__armors__cat">
            <Atitle level={4}>
              {t('characterCreation.step5.choose', {
                ns: 'components',
                qty: nbOptionnalArmorCharCreate,
              })}
            </Atitle>
            {optionnal.map((optionnalArmor) => (
              <Checkbox
                inputName={`armors.${optionnalArmor.armor._id}`}
                className="characterCreation-step5__choices__main__armor-input"
                control={control}
                key={optionnalArmor.armor._id}
                disabled={
                  countSelected - included.length >= nbOptionnalArmorCharCreate &&
                  armorSelected[optionnalArmor.armor._id] === false
                }
                label={<ArmorDisplay armor={optionnalArmor} mode="hover" />}
              />
            ))}
          </div>
        ) : null}
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
    let countSelected = 0;
    Object.values(bagSelected as Record<string, boolean>).forEach((isIncluded) => {
      if (isIncluded) {
        countSelected += 1;
      }
    });
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
          {t('itemTypeNames.bag', { count: included.length + nbOptionnalBagCharCreate })}
        </Atitle>
        {included.length > 0 ? (
          <div className="characterCreation-step5__choices__main__bags__cat">
            <Atitle level={4}>{t('characterCreation.step5.included', { ns: 'components' })}</Atitle>
            {included.map((includedBag) => (
              <BagDisplay key={includedBag.bag._id} bag={includedBag} mode="hover" />
            ))}
          </div>
        ) : null}

        {optionnal.length > 0 ? (
          <div className="characterCreation-step5__choices__main__bags__cat">
            <Atitle level={4}>
              {t('characterCreation.step5.choose', {
                ns: 'components',
                qty: nbOptionnalBagCharCreate,
              })}
            </Atitle>
            {optionnal.map((optionnalBag) => (
              <Checkbox
                inputName={`bags.${optionnalBag.bag._id}`}
                className="characterCreation-step5__choices__main__bag-input"
                control={control}
                key={optionnalBag.bag._id}
                disabled={
                  countSelected - included.length >= nbOptionnalBagCharCreate &&
                  bagSelected[optionnalBag.bag._id] === false
                }
                label={<BagDisplay bag={optionnalBag} mode="hover" />}
              />
            ))}
          </div>
        ) : null}
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
    let countSelected = 0;
    Object.values(itemSelected as Record<string, boolean>).forEach((isIncluded) => {
      if (isIncluded) {
        countSelected += 1;
      }
    });
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
          {t('itemTypeNames.itm', { count: included.length + nbOptionnalItemCharCreate })}
        </Atitle>
        {included.length > 0 ? (
          <div className="characterCreation-step5__choices__main__items__cat">
            <Atitle level={4}>{t('characterCreation.step5.included', { ns: 'components' })}</Atitle>
            {included.map((includedItem) => (
              <ItemDisplay key={includedItem.item._id} item={includedItem} mode="hover" />
            ))}
          </div>
        ) : null}

        {optionnal.length > 0 ? (
          <div className="characterCreation-step5__choices__main__items__cat">
            <Atitle level={4}>
              {t('characterCreation.step5.choose', {
                ns: 'components',
                qty: nbOptionnalItemCharCreate,
              })}
            </Atitle>
            {optionnal.map((optionnalItem) => (
              <Checkbox
                inputName={`items.${optionnalItem.item._id}`}
                className="characterCreation-step5__choices__main__item-input"
                control={control}
                key={optionnalItem.item._id}
                disabled={
                  countSelected - included.length >= nbOptionnalItemCharCreate &&
                  itemSelected[optionnalItem.item._id] === false
                }
                label={<ItemDisplay item={optionnalItem} mode="hover" />}
              />
            ))}
          </div>
        ) : null}
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
    let countSelected = 0;
    Object.values(programSelected as Record<string, boolean>).forEach((isIncluded) => {
      if (isIncluded) {
        countSelected += 1;
      }
    });
    Object.values(implantSelected as Record<string, boolean>).forEach((isIncluded) => {
      if (isIncluded) {
        countSelected += 1;
      }
    });
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
            qty: nbOptionnalOtherCharCreate,
          })}
        </Atitle>
        {optionnalPrograms.length > 0 ? (
          <div className="characterCreation-step5__choices__main__specialized__cat">
            <Atitle level={4}>{t('itemTypeNames.pro', { count: optionnalPrograms.length })}</Atitle>
            {optionnalPrograms.map((optionnalProgram) => (
              <Checkbox
                inputName={`programs.${optionnalProgram.program._id}`}
                className="characterCreation-step5__choices__main__specialized-input"
                control={control}
                key={optionnalProgram.program._id}
                disabled={
                  countSelected >= nbOptionnalOtherCharCreate &&
                  programSelected[optionnalProgram.program._id] === false
                }
                label={<ProgramDisplay program={optionnalProgram} mode="hover" />}
              />
            ))}
          </div>
        ) : null}
        {optionnalImplants.length > 0 ? (
          <div className="characterCreation-step5__choices__main__specialized__cat">
            <Atitle level={4}>{t('itemTypeNames.imp', { count: optionnalImplants.length })}</Atitle>
            {optionnalImplants.map((optionnalImplant) => (
              <Checkbox
                inputName={`implants.${optionnalImplant.implant._id}`}
                className="characterCreation-step5__choices__main__specialized-input"
                control={control}
                key={optionnalImplant.implant._id}
                disabled={
                  countSelected >= nbOptionnalOtherCharCreate &&
                  implantSelected[optionnalImplant.implant._id] === false
                }
                label={<ImplantDisplay implant={optionnalImplant} mode="hover" />}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <motion.div
      className={classTrim(`
        characterCreation-step5
      `)}
      initial={{
        transform: 'skew(90deg, 0deg) scale3d(.2, .2, .2)',
      }}
      animate={{
        transform: 'skew(0, 0) scale3d(1, 1, 1)',
        transitionEnd: {
          transform: 'none',
        },
      }}
      exit={{
        transform: 'skew(-90deg, 0deg) scale3d(.2, .2, .2)',
      }}
      transition={{ ease: 'easeInOut', duration: 0.2 }}
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
          <div className="characterCreation-step5__choices__main__blocks">
            {weaponChoices()}
            {armorChoices()}
            {bagChoices()}
            {itemChoices()}
            {specializedChoices()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CharacterCreationStep5;
