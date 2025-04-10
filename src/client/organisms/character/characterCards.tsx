import React, { useEffect, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars, useSingleCardWindow } from '../../providers';

import { Ap } from '../../atoms';
import { Card } from '../../molecules';

import type { IBasicArcaneCard } from '../../types';

import { classTrim } from '../../utils';

import './characterCards.scss';

const CharacterCards: FC = () => {
  const { character } = useGlobalVars();
  const { selectCard } = useSingleCardWindow();
  const { t } = useTranslation();

  const [flipped, setFlipped] = useState<boolean[]>([]);

  useEffect(() => {
    if (character !== null && character !== false && character.hand.length > 0) {
      setFlipped([...Array(character.hand.length).fill(false)]);
      setTimeout(() => {
        character.hand.forEach((_, id) => {
          setTimeout(() => {
            setFlipped((prev) => {
              const next = [...prev];
              next[id] = true;

              return next;
            });
          }, 50 * id);
        });
      }, 1000);
    }
  }, [character]);

  return (
    <div
      className={classTrim(`
      char-cards
    `)}
    >
      <Ap className="char-cards__title">{t('terms.card.name', { count: 2 })}</Ap>
      {character !== null && character !== false
        ? character.hand.map((card, index) => (
            <Card
              key={index}
              card={card}
              flipped={flipped[index]}
              size="mini"
              withInfo
              onClick={
                (card as Partial<IBasicArcaneCard>)._id !== undefined
                  ? () => {
                      selectCard(card as IBasicArcaneCard);
                    }
                  : undefined
              }
            />
          ))
        : null}
    </div>
  );
};

export default CharacterCards;
