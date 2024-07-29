import React, { useMemo, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { SearchBar, SkillDisplay, StatDisplay } from '../../molecules';
import { curateCharacterSkills } from '../../utils/character';

import { classTrim, type DiceRequest } from '../../utils';

import './characterSkills.scss';

interface ICharacterSkills {
  /** The function sent to roll the dices */
  onRollDices: (diceValues: DiceRequest[]) => void;
  /** The classname of the element */
  className?: string;
}

const CharacterSkills: FC<ICharacterSkills> = ({ className, onRollDices }) => {
  const { t } = useTranslation();
  const { character, skills, stats, cyberFrames } = useGlobalVars();

  const [searchWord, setSearchWord] = useState('');

  const aggregatedSkills = useMemo(
    () => curateCharacterSkills(character, skills, stats, cyberFrames),
    [character, skills, stats, cyberFrames]
  );

  const sortedSkillList = useMemo(() => {
    if (aggregatedSkills.skills.length === 0) {
      return [];
    }
    // TODO: Handle i18n here
    const textField = 'skill';
    return aggregatedSkills.skills.sort(function (a, b) {
      if (a[textField].title < b[textField].title) {
        return -1;
      }
      if (a[textField].title > b[textField].title) {
        return 1;
      }
      return 0;
    });
  }, [aggregatedSkills.skills]);

  return (
    <div
      className={classTrim(`
      char-skills
      ${className ?? ''}
    `)}
    >
      <div className="char-skills__stats">
        {aggregatedSkills.stats.map((stat) => (
          <StatDisplay
            key={stat.stat._id}
            stat={stat}
            onStatClick={(e) => {
              console.log('stat click', e);
            }}
          />
        ))}
      </div>

      <SearchBar
        placeholder={t('searchBar.placeholder', { ns: 'components' })}
        search={searchWord}
        className="char-skills__search-bar"
        onChange={(e) => {
          setSearchWord(e.target.value);
        }}
        onClean={() => {
          setSearchWord('');
        }}
      />

      <div className="char-skills__skills">
        {sortedSkillList.map((skill) => (
          <SkillDisplay
            key={skill.skill._id}
            skill={skill}
            onSkillClick={(e) => {
              console.log('skill click', e);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CharacterSkills;
