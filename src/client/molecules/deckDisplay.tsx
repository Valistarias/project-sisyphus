import React, { useEffect, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Ap } from '../atoms';

import Button from './button';
import Card from './card';

import type { IQuarkProps } from '../quark';
import type { ICampaign } from '../types';

import './deckDisplay.scss';

interface IDeckDisplay {
  /** The campaign that carries the deck to display */
  campaign: ICampaign;
  /** When the dungeon master re-shuffle the deck */
  onShuffle: (e: React.MouseEvent<HTMLElement>) => void;
}

const DeckDisplay: FC<IQuarkProps<IDeckDisplay>> = ({ campaign, onShuffle }) => {
  const { t } = useTranslation();

  const [cardFlipped, setCardFlipped] = useState<boolean[]>([]);

  useEffect(() => {
    setCardFlipped(() => campaign.deck.map(() => false));
  }, [campaign]);

  return (
    <div className="deck-display">
      <div className="deck-display__piles">
        <div className="deck-display__pile">
          <Ap className="deck-display__pile__text">
            {t('deckDisplay.drawPile', { ns: 'components' })}
          </Ap>
          <div className="deck-display__pile__base">
            {campaign.deck.length === 0 ? (
              <Ap className="deck-display__pile__base__empty">/</Ap>
            ) : (
              campaign.deck.toReversed().map((card, i) => (
                <Card
                  card={card}
                  flipped={!!cardFlipped[i]}
                  key={i}
                  className="deck-display__pile__base__elt"
                  onClick={() => {
                    setCardFlipped((prev) => {
                      const newArr = prev.map((prevBool, index) => {
                        if (i === index) {
                          return !prevBool;
                        } else {
                          return prevBool;
                        }
                      });

                      return newArr;
                    });
                  }}
                  withInfo
                />
              ))
            )}
          </div>
        </div>
        <div className="deck-display__pile">
          <Ap className="deck-display__pile__text">
            {t('deckDisplay.discardPile', { ns: 'components' })}
          </Ap>
          <div className="deck-display__pile__base">
            {campaign.discard.length === 0 ? (
              <Ap className="deck-display__pile__base__empty">/</Ap>
            ) : null}
          </div>
        </div>
      </div>
      <Button onClick={onShuffle}>{t('deckDisplay.shuffle', { ns: 'components' })}</Button>
    </div>
  );
};

export default DeckDisplay;
