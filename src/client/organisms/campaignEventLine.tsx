import React, { useMemo, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import holoBackground from '../assets/imgs/tvbg2.gif';
import { Ap } from '../atoms';
import DiceCard from '../molecules/diceCard';
import { type TypeCampaignEvent, type TypeDice } from '../types';

import { classTrim, strTodiceResult } from '../utils';

import './campaignEventLine.scss';

interface ICampaignEventResult {
  /** The total result of the dice roll */
  result: number;
  /** The name of the author of the dice roll */
  authorName: string;
  /** The formula of each die */
  formula: string;
  /** When the die was rolled */
  createdAt: Date;
  /** The type of the roll */
  type: TypeCampaignEvent;
}

const CampaignEventResult: FC<ICampaignEventResult> = ({
  result,
  authorName,
  formula,
  createdAt,
  type,
}) => {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(false);

  const detailScores = useMemo(() => {
    const dicesToUse: Array<{
      id: number;
      type: number;
      value: number;
    }> = [];
    let idDie = 0;
    strTodiceResult(formula).forEach((diceCat) => {
      if (diceCat.results.length > 0) {
        diceCat.results.forEach((result) => {
          dicesToUse.push({
            id: idDie,
            type: diceCat.type,
            value: result,
          });
          idDie += 1;
        });
      }
    });

    return dicesToUse.map(({ id, type, value }, index) => (
      <DiceCard key={id} type={type as TypeDice} value={value} size="xsmall" skip />
    ));
  }, [formula]);

  const typeCampaignEventText = useMemo(() => {
    return (
      <Ap className="campaign-event-line__result__type__text">
        <span className="campaign-event-line__result__type__text__long">
          {t('rollResults.freeCampaignEvent1', { ns: 'components' })}
        </span>{' '}
        {t('rollResults.freeCampaignEvent2', { ns: 'components' })}
      </Ap>
    );
  }, [t]);

  return (
    <div className="campaign-event-line">
      <Ap className="campaign-event-line__hour">{`${createdAt.toLocaleDateString()} - ${createdAt.getHours()}:${createdAt.getMinutes()}`}</Ap>
      <div
        className={classTrim(`
          campaign-event-line__result
        `)}
        style={{ backgroundImage: `url(${holoBackground})` }}
      >
        <div className="campaign-event-line__result__type">{typeCampaignEventText}</div>
        <div className="campaign-event-line__result__content">
          <Ap className="campaign-event-line__result__content__character">{authorName}</Ap>
          <Ap
            onClick={() => {
              setOpen((prev) => !prev);
            }}
            className="campaign-event-line__result__content__score"
          >
            {result.toString()}
          </Ap>
        </div>
      </div>
      {isOpen ? (
        <div className="campaign-event-line__info">
          <div className="campaign-event-line__info__arrow" />
          <div className="campaign-event-line__info__content">{detailScores}</div>
        </div>
      ) : null}
    </div>
  );
};

export default CampaignEventResult;
