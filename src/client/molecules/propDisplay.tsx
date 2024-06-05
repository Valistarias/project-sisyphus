import React, { forwardRef, type ReactNode } from 'react';

import { Ali, AnodeIcon, Ap, Atitle, Aul } from '../atoms';
import { RichTextElement } from '../organisms';
import { Quark, type IQuarkProps } from '../quark';
import { type ICuratedItemModifier } from '../types';
import { type TypeNodeIcons } from '../types/rules';

import { classTrim } from '../utils';

import './propDisplay.scss';

interface IPropDisplay extends IQuarkProps {
  /** The rarity text */
  rarity: string;
  /** The rarity level */
  rarityLevel: number;
  /** The icon used  */
  icon?: TypeNodeIcons;
  /** The title of the prop */
  title: string;
  /** The subtitle for the prop */
  subTitle?: string;
  /** The type for the prop */
  type: string;
  /** The item modifiers of the prop */
  itemModifiers: ICuratedItemModifier[] | undefined;
  /** The specialized content of the prop, main part */
  mainNode?: ReactNode;
  /** The specialized content of the prop, sub part */
  subNode?: ReactNode;
}

const PropDisplay = forwardRef<HTMLDivElement, IPropDisplay>(
  (
    {
      className,
      rarity,
      rarityLevel,
      icon,
      title,
      subTitle,
      type,
      mainNode,
      subNode,
      itemModifiers,
    },
    ref
  ) => {
    return (
      <Quark
        quarkType="div"
        ref={ref}
        className={classTrim(`
        prop-display
        prop-display--rarity-${rarityLevel}
        ${className ?? ''}
        `)}
      >
        {icon !== undefined ? (
          <AnodeIcon className="prop-display__icon" animated type={icon} size="large" />
        ) : null}

        <div className="prop-display__infos">
          <div className="prop-display__infos__top">
            <Atitle className="prop-display__infos__title" level={3}>
              {title}
              {subTitle !== undefined ? (
                <span className="prop-display__infos__title__sub">{subTitle}</span>
              ) : null}
            </Atitle>
            <Ap className="prop-display__infos__cat">{`${type} - ${rarity}`}</Ap>
          </div>
          <div className="prop-display__infos__mid">
            {mainNode !== undefined ? (
              <div className="prop-display__infos__mid-left">{mainNode}</div>
            ) : null}
            {subNode !== undefined ? (
              <div className="prop-display__infos__mid-right">{subNode}</div>
            ) : null}
          </div>
          {itemModifiers !== undefined && itemModifiers.length > 0 ? (
            <div className="prop-display__infos__bottom">
              <Aul noPoints className="prop-display__infos__modifiers">
                {itemModifiers.map(({ itemModifier }) => (
                  <Ali key={itemModifier._id} className="prop-display__infos__modifiers__elt">
                    {itemModifier.title}
                    <RichTextElement
                      className="prop-display__infos__modifiers__elt__text"
                      rawStringContent={itemModifier.summary}
                      readOnly
                    />
                  </Ali>
                ))}
              </Aul>
            </div>
          ) : null}
        </div>
      </Quark>
    );
  }
);

PropDisplay.displayName = 'PropDisplay';

export default PropDisplay;
