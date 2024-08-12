import React, { useMemo, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../providers';

import holoBackground from '../assets/imgs/tvbg2.gif';
import { Ap } from '../atoms';
import DiceCard from '../molecules/diceCard';
import { type TypeCampaignEvent, type TypeDice } from '../types';

import { addSymbol, classTrim, strTodiceResult } from '../utils';

import './campaignEventLine.scss';

interface ICampaignEventResult {
  /** The total result of the dice roll */
  result: number;
  /** The name of the author of the dice roll */
  authorName: string;
  /** The formula of each die */
  formula?: string;
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
  const { skills, stats } = useGlobalVars();

  const [isOpen, setOpen] = useState(false);

  const detailScores = useMemo(() => {
    if (formula === undefined) {
      return null;
    }
    const dicesToUse: Array<{
      id: number;
      type: number;
      value: number;
    }> = [];
    let idDie = 0;
    let totalOffset = 0;
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
        totalOffset += diceCat.offset;
      }
    });

    return (
      <>
        {dicesToUse.map(({ id, type, value }, index) => (
          <DiceCard key={id} type={type as TypeDice} value={value} size="xsmall" skip />
        ))}
        {totalOffset !== 0 ? (
          <Ap className="campaign-event-line__info__content__offset">{addSymbol(totalOffset)}</Ap>
        ) : null}
      </>
    );
  }, [formula]);

  const typeCampaignEventText = useMemo(() => {
    if (type.includes('skill-')) {
      const skillId = type.split('-')[1];
      const skill = skills.find(({ skill }) => skill._id === skillId);

      if (skill !== undefined) {
        // TODO: Handle i18n here
        const text = skill.skill;
        return (
          <Ap
            className="campaign-event-line__result__type__text"
            title={`${text.title} ${t('campaignEventResults.type.global.line2', { ns: 'components' })}`}
          >
            <span className="campaign-event-line__result__type__text__long">{text.title}</span>
            {t(`campaignEventResults.type.global.line2`, { ns: 'components' })}
          </Ap>
        );
      }
    }
    if (type.includes('stat-')) {
      const statId = type.split('-')[1];
      const stat = stats.find(({ stat }) => stat._id === statId);

      if (stat !== undefined) {
        // TODO: Handle i18n here
        const text = stat.stat;
        return (
          <Ap
            className="campaign-event-line__result__type__text"
            title={`${text.title} ${t('campaignEventResults.type.global.line2', { ns: 'components' })}`}
          >
            <span className="campaign-event-line__result__type__text__long">{text.title}</span>
            {t(`campaignEventResults.type.global.line2`, { ns: 'components' })}
          </Ap>
        );
      }
    }
    return (
      <Ap className="campaign-event-line__result__type__text">
        <span className="campaign-event-line__result__type__text__long">
          {t(`campaignEventResults.type.${type}.line1`, { ns: 'components' })}
        </span>
        {t(`campaignEventResults.type.${type}.line2`, { ns: 'components' })}
      </Ap>
    );
  }, [t, type, skills, stats]);

  const resultText = useMemo(() => {
    if (type === 'hpLoss') {
      return `${result} ${t(`terms.character.hp.short`)}`;
    }
    if (type === 'hpGain') {
      return `+${result} ${t(`terms.character.hp.short`)}`;
    }

    return result.toString();
  }, [result, t, type]);

  return (
    <div
      className={classTrim(`
      campaign-event-line
      ${detailScores !== null ? 'campaign-event-line--clickable' : ''}
    `)}
    >
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
            {resultText}
          </Ap>
        </div>
      </div>
      {isOpen && detailScores !== null ? (
        <div className="campaign-event-line__info">
          <div className="campaign-event-line__info__arrow" />
          <div className="campaign-event-line__info__content">{detailScores}</div>
        </div>
      ) : null}
    </div>
  );
};

export default CampaignEventResult;
