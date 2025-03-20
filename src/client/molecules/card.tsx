import React, { useMemo } from 'react';
import type { FC, ReactNode } from 'react';

import { useGlobalVars } from '../providers';

import holoBackground from '../assets/imgs/hologrambg.png';
import { AnodeIcon, Ap } from '../atoms';
import { arcaneNameToNodeIcon } from '../utils/character';

import type { IQuarkProps } from '../quark';
import type { IBasicArcaneCard, ICard, INumberCard } from '../types';

import { classTrim, romanize } from '../utils';

import './card.scss';

export interface ICardComponent {
  /** The card to display */
  card: ICard;
  /** The event when the card is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Is the card flipped ? */
  flipped: boolean;
}

const Card: FC<IQuarkProps<ICardComponent>> = ({ card, onClick, flipped, className }) => {
  const { arcanes } = useGlobalVars();

  const cardFront = useMemo(() => {
    if ((card as { hidden?: true }).hidden) {
      // Hidden Card
      return <div className="card__front" />;
    }

    if ((card as { _id?: string })._id !== undefined) {
      // Arcane Card
      const arcane = arcanes.find((arcane) => arcane.arcane._id === (card as IBasicArcaneCard)._id);

      if (arcane === undefined) {
        return <div className="card__front card__front--arcana" />;
      }

      return (
        <div className="card__front card__front--arcana">
          <div className="card__front__line" />
          <Ap className="card__front__top-text">{romanize(arcane.arcane.number)}</Ap>
          <Ap className="card__front__bottom-text">{romanize(arcane.arcane.number)}</Ap>
        </div>
      );
    }

    // Numbered Card

    const numberCard = card as INumberCard;

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
  }, [card, arcanes]);

  return (
    <div
      className={classTrim(`
        card
        ${onClick !== undefined ? 'card--clickable' : ''}
        ${flipped ? 'card--flipped' : ''}
        ${className ?? ''}
      `)}
      onClick={onClick}
    >
      <div className="card__inner">
        <div className="card__back" style={{ backgroundImage: `url(${holoBackground})` }}>
          <AnodeIcon className="card__back__icon" type="eidoloneye" />
        </div>
        {cardFront}
      </div>
    </div>
  );
};

export default Card;
