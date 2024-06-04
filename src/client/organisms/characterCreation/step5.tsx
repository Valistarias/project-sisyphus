import React, { useCallback, useMemo, type FC } from 'react';

import { motion } from 'framer-motion';
import { useForm, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ap, Atitle } from '../../atoms';
import { Checkbox, WeaponDisplay } from '../../molecules';
import {
  type ICuratedArmor,
  type ICuratedBag,
  type ICuratedImplant,
  type ICuratedItem,
  type ICuratedProgram,
  type ICuratedWeapon,
} from '../../types';

import { classTrim } from '../../utils';

import './characterCreation.scss';

interface FormValues {
  weapons: Record<string, boolean>;
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

  const createDefaultData = useCallback((weapons: ICuratedWeapon[]) => {
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

    return defaultData;
  }, []);

  const { handleSubmit, watch, control } = useForm<FieldValues>({
    defaultValues: useMemo(() => createDefaultData(weapons), [createDefaultData, weapons]),
  });

  const nbOptionnalWeaponCharCreate = useMemo(
    () =>
      Number(globalValues.find(({ name }) => name === 'nbOptionnalWeaponCharCreate')?.value ?? 0),
    [globalValues]
  );

  const weaponChoices = useMemo(() => {
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
    return (
      <div className="characterCreation-step5__choices__main__weapons">
        <Atitle className="characterCreation-step5__choices__main__weapons__title" level={3}>
          {t('itemTypeNames.wep', { count: 2 })}
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
            />
          ))}
        </div>
      </div>
    );
  }, [t, weapons, nbOptionnalWeaponCharCreate, control]);

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
          <div className="characterCreation-step5__choices__main__blocks">{weaponChoices}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default CharacterCreationStep5;
