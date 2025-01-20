import React, {
  useMemo, useRef, useState, type FC
} from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../providers';

import { Ap } from '../atoms';
import { PropDisplay } from '../molecules';
import {
  Quark, type IQuarkProps
} from '../quark';

import { RichTextElement } from './richTextElement';

import type {
  ICharParamBonus,
  ICuratedCharParam,
  ICuratedItem,
  ICuratedItemModifier,
  ICuratedRarity
} from '../types';
import type { IItem } from '../types/items';

import { classTrim } from '../utils';

import './itemDisplay.scss';

interface IItemDisplay {
  /** The item to be displayed */
  item: ICuratedItem
  /** The display mode */
  mode?: 'basic' | 'hover'
}

interface ICompleteCharParamBonus extends Omit<ICharParamBonus, 'charParam'> {
  charParam: ICuratedCharParam | undefined
}

interface ICompleteItem
  extends Omit<IItem, 'itemType' | 'itemModifiers' | 'rarity' | 'charParamBonuses'> {
  itemModifiers: ICuratedItemModifier[] | undefined
  rarity: ICuratedRarity | undefined
  charParamBonuses: ICompleteCharParamBonus[]
}

interface ICuratedCompleteItem extends Omit<ICuratedItem, 'item'> {
  item: ICompleteItem
}

const ItemDisplay: FC<IQuarkProps<IItemDisplay>> = ({
  item, mode = 'basic'
}) => {
  const { t } = useTranslation();
  const {
    itemTypes, itemModifiers, rarities, charParams
  } = useGlobalVars();

  const [placement, setPlacement] = useState<string>('left');
  const domBlockContent = useRef<HTMLDivElement>(null);

  const curateItem = useMemo<ICuratedCompleteItem | null>(() => {
    if (itemTypes.length === 0) {
      return null;
    }
    const {
      item: itemObj, i18n
    } = item;

    return {
      item: {
        ...itemObj,
        rarity: rarities.find(rarity => rarity.rarity._id === itemObj.rarity),
        itemModifiers: itemObj.itemModifiers?.map(
          itemModifierId =>
            itemModifiers.find(
              itemModifier => itemModifier.itemModifier._id === itemModifierId
            ) ?? itemModifiers[0]
        ),
        charParamBonuses:
          itemObj.charParamBonuses?.map(charParamBonus => ({
            ...charParamBonus,
            charParam: charParams.find(
              ({ charParam }) => charParam._id === charParamBonus.charParam
            )
          })) ?? []
      },
      i18n
    };
  }, [
    itemTypes,
    item,
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

  const itemBlock = useMemo(() => {
    if (curateItem === null) {
      return null;
    }

    // TODO: Internationalization
    const { item } = curateItem;
    const { rarity } = item;

    return (
      <PropDisplay
        ref={domBlockContent}
        className="item-display__block"
        rarity={rarity?.rarity.title ?? ''}
        rarityLevel={rarity?.rarity.position ?? 0}
        title={item.title}
        type={t('itemTypeNames.itm')}
        itemModifiers={item.itemModifiers}
        mainNode={(
          <div className="item-display__block__main">
            <RichTextElement
              className="item-display__block__main__text"
              rawStringContent={item.summary}
              readOnly
            />
          </div>
        )}
      />
    );
  }, [curateItem, t]);

  if (mode === 'hover') {
    return (
      <Quark
        quarkType="div"
        onMouseEnter={handleMouseEnter}
        className={classTrim(`
          item-display
          item-display--mode-${mode}
          item-display--${placement}
        `)}
      >
        <Ap className="item-display__text-hover">{curateItem?.item.title}</Ap>
        {itemBlock}
      </Quark>
    );
  }

  return (
    <Quark
      quarkType="span"
      className={classTrim(`
        item-display
        item-display--mode-${mode}
      `)}
    >
      {itemBlock}
    </Quark>
  );
};

export default ItemDisplay;
