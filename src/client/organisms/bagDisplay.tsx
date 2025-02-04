import React, { useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../providers';

import { Ap } from '../atoms';
import { PropDisplay } from '../molecules';
import { Quark, type IQuarkProps } from '../quark';

import type { ICuratedBag, ICuratedItemModifier, ICuratedRarity } from '../types';
import type { IBag } from '../types/items';

import { classTrim } from '../utils';

import './bagDisplay.scss';

interface IBagDisplay {
  /** The bag to be displayed */
  bag?: ICuratedBag;
  /** The display mode */
  mode?: 'basic' | 'hover';
}

interface ICompleteBag
  extends Omit<IBag, 'bagType' | 'itemModifiers' | 'rarity' | 'charParamBonuses'> {
  itemModifiers: ICuratedItemModifier[] | undefined;
  rarity: ICuratedRarity | undefined;
}

interface ICuratedCompleteBag extends Omit<ICuratedBag, 'bag'> {
  bag: ICompleteBag;
}

const BagDisplay: FC<IQuarkProps<IBagDisplay>> = ({ bag, mode = 'basic' }) => {
  const { t } = useTranslation();
  const { itemModifiers, rarities, itemTypes } = useGlobalVars();

  const [placement, setPlacement] = useState<string>('left');
  const domBlockContent = useRef<HTMLDivElement>(null);

  const curateBag = useMemo<ICuratedCompleteBag | null>(() => {
    if (bag === undefined) {
      return null;
    }
    const { bag: bagObj, i18n } = bag;

    return {
      bag: {
        ...bagObj,
        rarity: rarities.find((rarity) => rarity.rarity._id === bagObj.rarity),
        itemModifiers: bagObj.itemModifiers?.map(
          (itemModifierId) =>
            itemModifiers.find(
              (itemModifier) => itemModifier.itemModifier._id === itemModifierId
            ) ?? itemModifiers[0]
        ),
        storableItemTypes: bagObj.storableItemTypes.map((itemTypeId) => {
          const elt =
            itemTypes.find((itemType) => itemType._id === itemTypeId)?.name ?? itemTypes[0].name;

          return t(`itemTypeNames.${elt}`);
        }),
      },
      i18n,
    };
  }, [bag, rarities, itemModifiers, itemTypes, t]);

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

  const bagBlock = useMemo(() => {
    if (curateBag === null) {
      return null;
    }

    // TODO: Internationalization
    const { bag } = curateBag;
    const { rarity } = bag;

    const listItemTypes =
      bag.storableItemTypes.length === itemTypes.length
        ? t('display.bag.all', { ns: 'components' })
        : bag.storableItemTypes.join(', ');

    return (
      <PropDisplay
        ref={domBlockContent}
        className="bag-display__block"
        rarity={rarity?.rarity.title ?? ''}
        rarityLevel={rarity?.rarity.position ?? 0}
        title={bag.title}
        type={t('itemTypeNames.bag')}
        itemModifiers={bag.itemModifiers}
        mainNode={
          <div className="bag-display__block__main">
            <Ap className="bag-display__block__main__text">
              {t('display.bag.text', {
                ns: 'components',
                list: listItemTypes,
              })}
            </Ap>
            <Ap className="bag-display__block__main__sub">
              {t('display.bag.qty', {
                ns: 'components',
                qty: bag.size,
              })}
            </Ap>
          </div>
        }
      />
    );
  }, [curateBag, itemTypes, t]);

  if (mode === 'hover') {
    return (
      <Quark
        quarkType="div"
        onMouseEnter={handleMouseEnter}
        className={classTrim(`
          bag-display
          bag-display--mode-${mode}
          bag-display--${placement}
        `)}
      >
        <Ap className="bag-display__text-hover">{curateBag?.bag.title}</Ap>
        {bagBlock}
      </Quark>
    );
  }

  return (
    <Quark
      quarkType="span"
      className={classTrim(`
        bag-display
        bag-display--mode-${mode}
      `)}
    >
      {bagBlock}
    </Quark>
  );
};

export default BagDisplay;
