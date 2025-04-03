import React, { useMemo, useRef, useState } from 'react';
import type { FC, ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../providers';

import holoBackground from '../assets/imgs/hologrambg.png';
import { AnodeIcon, Ap, Atitle } from '../atoms';
import ANodeIcon from '../atoms/anodeIcon';
import { RichTextElement } from '../organisms';
import { arcaneNameToNodeIcon } from '../utils/character';

import type { IQuarkProps } from '../quark';
import type { IBasicArcaneCard, ICard, INumberCard } from '../types';
import type { TypeNodeIcons } from '../types/rules';

import { classTrim, romanize, setHintPlacement } from '../utils';
import './card.scss';

export interface ICardComponent {
  /** The card to display */
  card: ICard;
  /** The event when the card is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Is the card flipped ? */
  flipped: boolean;
  /** The size of the card */
  size?: 'xlarge' | 'large' | 'medium' | 'small' | 'mini';
  /** Is there the panel information attached ? */
  withInfo?: boolean;
}

const Card: FC<IQuarkProps<ICardComponent>> = ({
  card,
  onClick,
  flipped,
  className,
  size = 'medium',
  withInfo = false,
}) => {
  const { arcanes } = useGlobalVars();
  const { t } = useTranslation();

  const [placement, setPlacement] = useState<{ top: string; left: string }>({
    top: '0px',
    left: '0px',
  });

  const domPosition = useRef<HTMLDivElement>(null);
  const hintPosition = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (): void => {
    if (domPosition.current !== null && hintPosition.current !== null) {
      const padding = 20;

      const domPos = domPosition.current.getBoundingClientRect();
      const hintPos = hintPosition.current.getBoundingClientRect();

      const hintPlacement = setHintPlacement(domPos, hintPos, 'right');

      if (hintPlacement === 'right') {
        setPlacement({
          top: `${domPos.top + domPos.height / 2 - hintPos.height / 2}px`,
          left: `${domPos.right + padding}px`,
        });
      } else {
        setPlacement({
          top: `${domPos.top + domPos.height / 2 - hintPos.height / 2}px`,
          left: `${domPos.left - padding - hintPos.width}px`,
        });
      }
    }
  };

  const cardFront = useMemo(() => {
    if ((card as { hidden?: true }).hidden) {
      // Hidden Card
      return <div className="card__front" />;
    }

    if ((card as { _id?: string })._id !== undefined) {
      // Arcane Card
      const arcane = arcanes.find((arcane) => arcane.arcane._id === (card as IBasicArcaneCard)._id);

      if (size === 'mini') {
        if (arcane === undefined) {
          return <div className="card__front card__front-mini card__front--arcane" />;
        }

        const roman = arcane.arcane.number !== 0 ? romanize(arcane.arcane.number) : ' ';

        return (
          <div className="card__front card__front-mini card__front--arcane">
            <ANodeIcon
              className="card__front-mini__arcane"
              type={`tarot${arcane.arcane.number}` as TypeNodeIcons}
            />
            <Ap className="card__front-mini__right-text">
              <span className="card__front-mini__right-text__lines" />
              <span className="card__front-mini__right-text__content">{roman}</span>
              <span className="card__front-mini__right-text__lines" />
            </Ap>
          </div>
        );
      }

      if (arcane === undefined) {
        return <div className="card__front card__front--arcane" />;
      }

      const roman = arcane.arcane.number !== 0 ? romanize(arcane.arcane.number) : ' ';

      return (
        <div className="card__front card__front--arcane">
          <div className="card__front__line" />
          <Ap className="card__front__top-text">{roman}</Ap>
          <Ap className="card__front__bottom-text">{roman}</Ap>
          <ANodeIcon
            className="card__front__image"
            type={`tarot${arcane.arcane.number}` as TypeNodeIcons}
          />
          <ANodeIcon
            className="card__front__image-accent"
            type={`tarot${arcane.arcane.number}` as TypeNodeIcons}
          />
        </div>
      );
    }

    // Numbered Card

    const numberCard = card as INumberCard;

    if (size === 'mini') {
      return (
        <div className="card__front card__front-mini">
          <Ap className="card__front-mini__value">{numberCard.number}</Ap>
          <AnodeIcon
            className="card__front-mini__symbol"
            type={arcaneNameToNodeIcon(numberCard.suit)}
          />
        </div>
      );
    }

    const sideColumnsContent: ReactNode[] = [];
    const centerColumnContent: ReactNode[] = [];

    // Switch for side
    switch (numberCard.number) {
      case 10:
      case 8: {
        for (let i = 0; i < 4; i++) {
          sideColumnsContent.push(
            <AnodeIcon
              className="card__front__symbol"
              type={arcaneNameToNodeIcon(numberCard.suit)}
              key={i}
            />
          );
        }
        break;
      }
      case 9: {
        for (let i = 0; i < 5; i++) {
          if (i === 2) {
            sideColumnsContent.push(<div key={i} className="card__front__blank" />);
          } else {
            sideColumnsContent.push(
              <AnodeIcon
                className="card__front__symbol"
                type={arcaneNameToNodeIcon(numberCard.suit)}
                key={i}
              />
            );
          }
        }
        break;
      }
      case 7:
      case 6: {
        for (let i = 0; i < 5; i++) {
          if (i === 2) {
            sideColumnsContent.push(<div key={i} className="card__front__line-dot" />);
          } else if (i === 1 || i === 3) {
            sideColumnsContent.push(<div key={i} className="card__front__blank" />);
          } else {
            sideColumnsContent.push(
              <AnodeIcon
                className="card__front__symbol"
                type={arcaneNameToNodeIcon(numberCard.suit)}
                key={i}
              />
            );
          }
        }
        break;
      }
      case 5: {
        for (let i = 0; i < 3; i++) {
          if (i === 1) {
            sideColumnsContent.push(<div key={i} className="card__front__line-dot" />);
          } else {
            sideColumnsContent.push(
              <AnodeIcon
                className="card__front__symbol"
                type={arcaneNameToNodeIcon(numberCard.suit)}
                key={i}
              />
            );
          }
        }
        break;
      }
      case 4: {
        sideColumnsContent.push(
          <AnodeIcon
            className="card__front__symbol"
            key="single"
            type={arcaneNameToNodeIcon(numberCard.suit)}
          />
        );
        break;
      }
    }

    // Switch for center
    switch (numberCard.number) {
      case 10:
      case 6:
      case 4:
      case 2: {
        for (let i = 0; i < 3; i++) {
          if (i === 1) {
            centerColumnContent.push(
              <div key={i} className="card__front__blank">
                <div className="card__front__line-dot-center" />
              </div>
            );
          } else {
            centerColumnContent.push(
              <AnodeIcon
                className="card__front__symbol"
                type={arcaneNameToNodeIcon(numberCard.suit)}
                key={i}
              />
            );
          }
        }
        break;
      }
      case 9: {
        for (let i = 0; i < 3; i++) {
          if (i === 1) {
            centerColumnContent.push(
              <AnodeIcon
                className="card__front__symbol"
                type={arcaneNameToNodeIcon(numberCard.suit)}
                key={i}
              />
            );
          } else {
            centerColumnContent.push(<div key={i} className="card__front__line-dot" />);
          }
        }
        break;
      }
      case 8: {
        centerColumnContent.push(<div className="card__front__line-dot" key="single" />);
        break;
      }
      case 7:
      case 3: {
        for (let i = 0; i < 3; i++) {
          centerColumnContent.push(
            <AnodeIcon
              className="card__front__symbol"
              type={arcaneNameToNodeIcon(numberCard.suit)}
              key={i}
            />
          );
        }
        break;
      }
      case 5:
      case 1: {
        centerColumnContent.push(
          <AnodeIcon
            className="card__front__symbol"
            key="single"
            type={arcaneNameToNodeIcon(numberCard.suit)}
          />
        );
        break;
      }
    }

    return (
      <div
        className={classTrim(`
        card__front
        card__front--number
        card__front--number--${numberCard.number}
      `)}
      >
        <div className="card__front__side">{sideColumnsContent}</div>
        <div className="card__front__center">{centerColumnContent}</div>
        <div className="card__front__side">{sideColumnsContent}</div>
      </div>
    );
  }, [card, size, arcanes]);

  const cardHintContent = useMemo(() => {
    if ((card as { number?: number }).number !== undefined) {
      const numberCard = card as INumberCard;

      return (
        <Ap className="card-hint__number">
          <span className="card-hint__number__value">{numberCard.number}</span>
          <span className="card-hint__number__liaison">{t('card.xOfy', { ns: 'components' })}</span>
          <span className="card-hint__number__color">{t(`terms.suit.${numberCard.suit}`)}</span>
        </Ap>
      );
    }

    if ((card as { _id?: string })._id !== undefined) {
      const arcane = arcanes.find((arcane) => arcane.arcane._id === (card as IBasicArcaneCard)._id);

      if (arcane !== undefined) {
        return (
          <div className="card-hint__arcana">
            <Atitle className="card-hint__arcana__title" level={3}>
              <span className="card-hint__arcana__title__number">
                {romanize(arcane.arcane.number)}
              </span>
              <span>{` - ${arcane.arcane.title}`}</span>
            </Atitle>
            <RichTextElement
              className="card-hint__arcana__text"
              rawStringContent={arcane.arcane.summary}
              readOnly
            />
          </div>
        );
      }
    }

    return <Ap className="card-hint__unknown">???</Ap>;
  }, [card, arcanes, t]);

  return (
    <div
      className={classTrim(`
      card-block
      ${flipped ? 'card-block--flipped' : ''}
      ${withInfo ? 'card-block--info' : ''}
    `)}
    >
      <div
        className={classTrim(`
          card
          card--${size}
          ${onClick !== undefined ? 'card--clickable' : ''}
          ${className ?? ''}
        `)}
        onClick={onClick}
        ref={domPosition}
      >
        <div className="card__inner" onMouseEnter={handleMouseEnter}>
          <div className="card__back" style={{ backgroundImage: `url(${holoBackground})` }}>
            <AnodeIcon className="card__back__icon" type="eidoloneye" />
          </div>
          {cardFront}
        </div>
      </div>
      <div className="card-hint" ref={hintPosition} style={placement}>
        {cardHintContent}
      </div>
    </div>
  );
};

export default Card;
