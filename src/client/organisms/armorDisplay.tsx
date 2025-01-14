import React, {
  useMemo, useRef, useState, type FC
} from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../providers';

import {
  Ali, Ap, Atitle, Aul
} from '../atoms';
import { PropDisplay } from '../molecules';
import {
  Quark, type IQuarkProps
} from '../quark';

import type {
  ICharParamBonus,
  ICuratedArmor,
  ICuratedArmorType,
  ICuratedCharParam,
  ICuratedItemModifier,
  ICuratedRarity
} from '../types';
import type { IArmor } from '../types/items';

import { classTrim } from '../utils';

import './armorDisplay.scss';

interface IArmorDisplay extends IQuarkProps {
  /** The armor to be displayed */
  armor: ICuratedArmor
  /** The display mode */
  mode?: 'basic' | 'hover'
}

interface ICompleteCharParamBonus extends Omit<ICharParamBonus, 'charParam'> {
  charParam: ICuratedCharParam | undefined
}

interface ICompleteArmor
  extends Omit<IArmor, 'armorType' | 'itemModifiers' | 'rarity' | 'charParamBonuses'> {
  armorType: ICuratedArmorType | undefined
  itemModifiers: ICuratedItemModifier[] | undefined
  rarity: ICuratedRarity | undefined
  charParamBonuses: ICompleteCharParamBonus[]
}

interface ICuratedCompleteArmor extends Omit<ICuratedArmor, 'armor'> {
  armor: ICompleteArmor
}

const ArmorDisplay: FC<IArmorDisplay> = ({
  armor, mode = 'basic'
}) => {
  const { t } = useTranslation();
  const {
    armorTypes, itemModifiers, rarities, charParams
  } = useGlobalVars();

  const [placement, setPlacement] = useState<string>('left');
  const domBlockContent = useRef<HTMLDivElement>(null);

  const curateArmor = useMemo<ICuratedCompleteArmor | null>(() => {
    if (armorTypes.length === 0 || armor === undefined) {
      return null;
    }
    const {
      armor: armorObj, i18n
    } = armor;

    return {
      armor: {
        ...armorObj,
        armorType: armorTypes.find(armorType => armorType.armorType._id === armorObj.armorType),
        rarity: rarities.find(rarity => rarity.rarity._id === armorObj.rarity),
        itemModifiers: armorObj.itemModifiers?.map(
          itemModifierId =>
            itemModifiers.find(
              itemModifier => itemModifier.itemModifier._id === itemModifierId
            ) ?? itemModifiers[0]
        ),
        charParamBonuses:
          armorObj.charParamBonuses?.map(charParamBonus => ({
            ...charParamBonus,
            charParam: charParams.find(
              ({ charParam }) => charParam._id === charParamBonus.charParam
            )
          })) ?? []
      },
      i18n
    };
  }, [
    armorTypes,
    armor,
    rarities,
    itemModifiers,
    charParams
  ]);

  const handleMouseEnter = (): void => {
    if (mode === 'hover') {
      if (domBlockContent.current !== null) {
        const dimensions = domBlockContent.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        let leftRight = placement;

        if (leftRight === 'left' && dimensions.right > windowWidth && dimensions.left > 60) {
          leftRight = 'right';
        } else if (leftRight === 'right' && dimensions.left < 0) {
          leftRight = 'left';
        }
        setPlacement(leftRight);
      }
    }
  };

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
        ref={domBlockContent}
        className="armor-display__block"
        rarity={rarity?.rarity.title ?? ''}
        rarityLevel={rarity?.rarity.position ?? 0}
        title={armor.title}
        type={type?.armorType.title ?? ''}
        itemModifiers={armor.itemModifiers}
        mainNode={(
          <div className="armor-display__block__main">
            <Atitle className="weapon-display__block__main__title" level={4}>
              {t('display.cat.bonuses', { ns: 'components' })}
            </Atitle>
            <Aul noPoints className="weapon-display__block__bonuses">
              {armor.charParamBonuses.map(charParamBonus => (
                <Ali key={charParamBonus._id} className="weapon-display__block__bonuses__elt">
                  {`+${charParamBonus.value} ${charParamBonus.charParam?.charParam.title}`}
                </Ali>
              ))}
            </Aul>
          </div>
        )}
      />
    );
  }, [curateArmor, t]);

  if (mode === 'hover') {
    return (
      <Quark
        quarkType="div"
        onMouseEnter={handleMouseEnter}
        className={classTrim(`
          armor-display
          armor-display--mode-${mode}
          armor-display--${placement}
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
