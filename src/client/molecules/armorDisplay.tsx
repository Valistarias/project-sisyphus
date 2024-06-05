import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../providers';

import { Ap } from '../atoms';
import { Quark, type IQuarkProps } from '../quark';
import {
  type ICuratedArmor,
  type ICuratedArmorType,
  type ICuratedItemModifier,
  type ICuratedRarity,
} from '../types';
import { type IArmor } from '../types/items';

import PropDisplay from './propDisplay';

import { classTrim } from '../utils';

import './armorDisplay.scss';

interface IArmorDisplay extends IQuarkProps {
  /** The armor to be displayed */
  armor: ICuratedArmor;
  /** The display mode */
  mode?: 'basic' | 'hover';
}

interface ICompleteArmor
  extends Omit<IArmor, 'armorType' | 'armorScope' | 'itemModifiers' | 'rarity' | 'damages'> {
  armorType: ICuratedArmorType | undefined;
  itemModifiers: ICuratedItemModifier[] | undefined;
  rarity: ICuratedRarity | undefined;
}

interface ICuratedCompleteArmor extends Omit<ICuratedArmor, 'armor'> {
  armor: ICompleteArmor;
}

const ArmorDisplay: FC<IArmorDisplay> = ({ armor, mode = 'basic' }) => {
  const { t } = useTranslation();
  const { armorTypes, itemModifiers, rarities } = useGlobalVars();

  const curateArmor = useMemo<ICuratedCompleteArmor | null>(() => {
    if (armorTypes.length === 0 || armor === undefined) {
      return null;
    }
    const { armor: armorObj, i18n } = armor;
    return {
      armor: {
        ...armorObj,
        armorType: armorTypes.find((armorType) => armorType.armorType._id === armorObj.armorType),
        rarity: rarities.find((rarity) => rarity.rarity._id === armorObj.rarity),
        itemModifiers: armorObj.itemModifiers?.map(
          (itemModifierId) =>
            itemModifiers.find(
              (itemModifier) => itemModifier.itemModifier._id === itemModifierId
            ) ?? itemModifiers[0]
        ),
      },
      i18n,
    };
  }, [armorTypes, armor, rarities, itemModifiers]);

  const armorBlock = useMemo(() => {
    if (curateArmor === null) {
      return null;
    }

    const type = curateArmor.armor.armorType;
    // TODO: Internationalization
    const { armor } = curateArmor;
    const { rarity } = armor;

    return (
      <PropDisplay
        className="armor-display__block"
        rarity={rarity?.rarity.title ?? ''}
        rarityLevel={rarity?.rarity.position ?? 0}
        title={armor.title}
        type={type?.armorType.title ?? ''}
        itemModifiers={armor.itemModifiers}
      />
    );
  }, [curateArmor]);

  if (mode === 'hover') {
    return (
      <Quark
        quarkType="div"
        className={classTrim(`
        armor-display
        armor-display--mode-${mode}
      `)}
      >
        <Ap className="armor-display__text-hover">{curateArmor?.armor.title}</Ap>
        {armorBlock}
      </Quark>
    );
  }

  return (
    <Quark
      quarkType="span"
      className={classTrim(`
        armor-display
        armor-display--mode-${mode}
      `)}
    >
      {armorBlock}
    </Quark>
  );
};

export default ArmorDisplay;
