import React, { useEffect, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ap } from '../../atoms';
import { Card } from '../../molecules';

import { classTrim } from '../../utils';

import './characterCards.scss';

const CharacterCards: FC = () => {
  const { character } = useGlobalVars();
  const { t } = useTranslation();

  const [flipped, setFlipped] = useState<boolean>(false);

  useEffect(() => {
    if (character !== null && character !== false) {
      setTimeout(() => {
        setFlipped(true);
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
            <Card key={index} card={card} flipped={flipped} size="mini" withInfo />
          ))
        : null}
    </div>
  );
};

export default CharacterCards;
