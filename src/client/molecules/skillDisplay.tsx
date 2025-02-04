import React, { useMemo, type FC } from 'react';

import { Ap } from '../atoms';

import ClickableText from './clickableText';
import DetailsBonuses from './detailsBonuses';

import type { ICuratedSkill, ICuratedStat } from '../types';
import type { IScore } from '../utils/character';

import { addSymbol } from '../utils';

import './skillDisplay.scss';

interface ISkillDisplay {
  /** The skill to display */
  skill: ICuratedSkill & {
    score: IScore;
    stat: ICuratedStat;
  };
  /** When the clickable zone is clicked */
  onSkillClick: (
    skill: ICuratedSkill & {
      score: IScore;
      stat: ICuratedStat;
    }
  ) => void;
}

const SkillDisplay: FC<ISkillDisplay> = ({ skill, onSkillClick }) => {
  // TODO: Deal with i18n
  const texts = useMemo(
    () =>
      // insert lang detection here
      skill.skill,
    [skill]
  );

  return (
    <div className="skill-display">
      <Ap className="skill-display__title">{texts.title}</Ap>
      <div className="skill-display__line" />
      <ClickableText
        className="skill-display__mod-value"
        text={addSymbol(skill.score.total)}
        onClick={() => {
          onSkillClick(skill);
        }}
        hint={<DetailsBonuses bonuses={[...skill.score.sources]} stat={skill.stat} />}
      />
    </div>
  );
};

export default SkillDisplay;
