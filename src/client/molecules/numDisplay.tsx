import React, { type FC } from 'react';

import { Ap } from '../atoms';
import { RichTextElement } from '../organisms';
import { type ICuratedStat } from '../types';
import { type ISourcePoints } from '../utils/character';

import ClickableText from './clickableText';
import DetailsBonuses from './detailsBonuses';
import Helper from './helper';

import './numDisplay.scss';

interface INumDisplay {
  /** The text of the Display */
  text: {
    title: string;
    short: string;
    summary?: string;
  };
  value: string;
  /** The stat element, if there is stat bonuses */
  stat?: ICuratedStat;
  /** When the clickable zone is clicked */
  onClick?: () => void;
  /** The bonuses displayed in the hint */
  bonuses?: ISourcePoints[];
}

const NumDisplay: FC<INumDisplay> = ({ text, stat, value, bonuses, onClick }) => {
  return (
    <div className="num-display">
      <Ap className="num-display__title">{text.title.length < 12 ? text.title : text.short}</Ap>
      <ClickableText
        className="num-display__mod-value"
        text={value}
        onClick={onClick ?? undefined}
        hint={
          bonuses !== undefined && bonuses.length > 0 ? (
            <DetailsBonuses bonuses={bonuses} stat={stat} />
          ) : undefined
        }
      />
      <Helper size="small">
        <RichTextElement rawStringContent={text.summary} readOnly />
      </Helper>
      <div className="num-display__bg" />
    </div>
  );
};

export default NumDisplay;
