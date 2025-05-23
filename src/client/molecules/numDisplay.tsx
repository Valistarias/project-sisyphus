import React, { type FC } from 'react';

import { Ap } from '../atoms';

import ClickableText from './clickableText';
import DetailsBonuses from './detailsBonuses';

import type { ICuratedStat } from '../types';
import type { ISourcePoints } from '../utils/character';

import './numDisplay.scss';
import { classTrim } from '../utils';

interface INumDisplay {
  /** The size of the Display */
  size?: 'medium' | 'small';
  /** The text of the Display */
  text?: {
    title?: string;
    short?: string;
    summary?: string;
  };
  /** The value of the Display */
  value: string;
  /** The stat element, if there is stat bonuses */
  stat?: ICuratedStat;
  /** When the clickable zone is clicked */
  onClick?: () => void;
  /** The bonuses displayed in the hint */
  bonuses?: ISourcePoints[];
}

const NumDisplay: FC<INumDisplay> = ({ text, stat, size = 'medium', value, bonuses, onClick }) => (
  <div
    className={classTrim(`
      num-display
      num-display--${size}
    `)}
  >
    {text?.title !== undefined && text.short !== undefined && (
      <Ap className="num-display__title">{text.title.length < 12 ? text.title : text.short}</Ap>
    )}
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
    {/* <Helper size="small">
      <RichTextElement rawStringContent={text.summary} readOnly />
    </Helper> */}
    <div className="num-display__bg" />
  </div>
);

export default NumDisplay;
