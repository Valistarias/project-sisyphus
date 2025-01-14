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
  ICuratedCharParam,
  ICuratedImplant,
  ICuratedItemModifier,
  ICuratedRarity
} from '../types';
import type { IImplant } from '../types/items';

import { classTrim } from '../utils';

import './implantDisplay.scss';

interface IImplantDisplay extends IQuarkProps {
  /** The implant to be displayed */
  implant: ICuratedImplant
  /** The display mode */
  mode?: 'basic' | 'hover'
}

interface ICompleteCharParamBonus extends Omit<ICharParamBonus, 'charParam'> {
  charParam: ICuratedCharParam | undefined
}

interface ICompleteImplant extends Omit<IImplant, 'itemModifiers' | 'rarity' | 'charParamBonuses'> {
  itemModifiers: ICuratedItemModifier[] | undefined
  rarity: ICuratedRarity | undefined
  charParamBonuses: ICompleteCharParamBonus[]
}

interface ICuratedCompleteImplant extends Omit<ICuratedImplant, 'implant'> {
  implant: ICompleteImplant
}

const ImplantDisplay: FC<IImplantDisplay> = ({
  implant, mode = 'basic'
}) => {
  const { t } = useTranslation();
  const {
    bodyParts: sentBodyparts, itemModifiers, rarities, charParams
  } = useGlobalVars();

  const [placement, setPlacement] = useState<string>('left');
  const domBlockContent = useRef<HTMLDivElement>(null);

  const curateImplant = useMemo<ICuratedCompleteImplant | null>(() => {
    if (sentBodyparts.length === 0 || implant === undefined) {
      return null;
    }
    const {
      implant: implantObj, i18n
    } = implant;

    return {
      implant: {
        ...implantObj,
        bodyParts: implantObj.bodyParts.map(
          bodyPartId =>
            sentBodyparts.find(({ bodyPart }) => bodyPart._id === bodyPartId)?.bodyPart.title
            ?? sentBodyparts[0].bodyPart.title
        ),
        rarity: rarities.find(rarity => rarity.rarity._id === implantObj.rarity),
        itemModifiers: implantObj.itemModifiers?.map(
          itemModifierId =>
            itemModifiers.find(
              itemModifier => itemModifier.itemModifier._id === itemModifierId
            ) ?? itemModifiers[0]
        ),
        charParamBonuses:
          implantObj.charParamBonuses?.map(charParamBonus => ({
            ...charParamBonus,
            charParam: charParams.find(
              ({ charParam }) => charParam._id === charParamBonus.charParam
            )
          })) ?? []
      },
      i18n
    };
  }, [
    sentBodyparts,
    implant,
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

  const implantBlock = useMemo(() => {
    if (curateImplant === null) {
      return null;
    }

    // TODO: Internationalization
    const { implant } = curateImplant;
    const { rarity } = implant;

    const listBodyParts = implant.bodyParts.join(', ');

    return (
      <PropDisplay
        ref={domBlockContent}
        className="implant-display__block"
        rarity={rarity?.rarity.title ?? ''}
        rarityLevel={rarity?.rarity.position ?? 0}
        title={implant.title}
        subTitle={listBodyParts}
        type={t('itemTypeNames.imp')}
        itemModifiers={implant.itemModifiers}
        mainNode={
          implant.charParamBonuses.length > 0
            ? (
                <div className="implant-display__block__main">
                  <Atitle className="weapon-display__block__main__title" level={4}>
                    {t('display.cat.bonuses', { ns: 'components' })}
                  </Atitle>
                  <Aul noPoints className="weapon-display__block__bonuses">
                    {implant.charParamBonuses.map(charParamBonus => (
                      <Ali key={charParamBonus._id} className="weapon-display__block__bonuses__elt">
                        {`+${charParamBonus.value} ${charParamBonus.charParam?.charParam.title}`}
                      </Ali>
                    ))}
                  </Aul>
                </div>
              )
            : undefined
        }
        effects={implant.effects}
      />
    );
  }, [curateImplant, t]);

  if (mode === 'hover') {
    return (
      <Quark
        quarkType="div"
        onMouseEnter={handleMouseEnter}
        className={classTrim(`
          implant-display
          implant-display--mode-${mode}
          implant-display--${placement}
        `)}
      >
        <Ap className="implant-display__text-hover">{curateImplant?.implant.title}</Ap>
        {implantBlock}
      </Quark>
    );
  }

  return (
    <Quark
      quarkType="span"
      className={classTrim(`
        implant-display
        implant-display--mode-${mode}
      `)}
    >
      {implantBlock}
    </Quark>
  );
};

export default ImplantDisplay;
