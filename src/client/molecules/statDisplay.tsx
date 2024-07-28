import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Ap } from '../atoms';
import { RichTextElement } from '../organisms';
import { type ICuratedStat } from '../types';
import { calculateStatModToString, type IScoreStatSkill } from '../utils/character';

import ClickableText from './clickableText';
import Helper from './helper';

import './statDisplay.scss';

interface IStatDisplay {
  /** The stat to display */
  stat: ICuratedStat & {
    score: IScoreStatSkill;
  };
  /** When the clickable zone is clicked */
  onStatClick: (
    stat: ICuratedStat & {
      score: IScoreStatSkill;
    }
  ) => void;
}

const StatDisplay: FC<IStatDisplay> = ({ stat, onStatClick }) => {
  const { t } = useTranslation();

  // TODO: Deal with i18n
  const texts = useMemo(() => {
    // insert lang detection here
    return stat.stat;
  }, [stat]);
  console.log('stat', stat);
  return (
    <div className="stat-display">
      <Ap className="stat-display__title">{texts.title}</Ap>
      <ClickableText
        className="stat-display__mod-value"
        text={String(calculateStatModToString(stat.score.total))}
        onClick={() => {
          onStatClick(stat);
        }}
      />
      <Helper size="small">
        <RichTextElement rawStringContent={texts.summary} readOnly />
      </Helper>
      <div className="stat-display__bg" />
    </div>
  );
};

export default StatDisplay;
