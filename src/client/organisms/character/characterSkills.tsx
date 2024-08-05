import React, { useMemo, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { NumDisplay, SearchBar, SkillDisplay } from '../../molecules';
import { type TypeCampaignEvent } from '../../types';
import {
  calculateStatMod,
  calculateStatModToString,
  curateCharacterSkills,
  malusStatMod,
} from '../../utils/character';

import { classTrim, removeDiacritics, type DiceRequest } from '../../utils';

import './characterSkills.scss';

interface ICharacterSkills {
  /** The function sent to roll the dices */
  onRollDices: (diceValues: DiceRequest[], id: TypeCampaignEvent) => void;
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
    const searchElt = removeDiacritics(searchWord).toLowerCase();

    const filteredBySearch = aggregatedSkills.skills.filter((skill) => {
      const curatedTitle = removeDiacritics(skill[textField].title).toLowerCase();
      return !!curatedTitle.includes(searchElt);
    });

    return filteredBySearch.sort(function (a, b) {
      if (a[textField].title < b[textField].title) {
        return -1;
      }
      if (a[textField].title > b[textField].title) {
        return 1;
      }
      return 0;
    });
  }, [aggregatedSkills.skills, searchWord]);

  const statList = useMemo(() => {
    return (
      <div className="char-skills__stats">
        {aggregatedSkills.stats.map((stat) => {
          // TODO: Deal with i18n
          const { title, summary } = useMemo(() => {
            // insert lang detection here
            return stat.stat;
          }, [stat]);
          return (
            <NumDisplay
              key={stat.stat._id}
              stat={stat}
              text={{ title, summary }}
              value={calculateStatModToString(stat.score.total)}
              bonuses={[
                ...stat.score.sources,
                {
                  fromThrottleStat: true,
                  value: malusStatMod,
                },
              ]}
              onClick={() => {
                onRollDices(
                  [
                    {
                      qty: 2,
                      type: 8,
                      offset: calculateStatMod(stat.score.total),
                    },
                  ],
                  `stat-${stat.stat._id}`
                );
              }}
            />
          );
        })}
      </div>
    );
  }, [aggregatedSkills.stats, onRollDices]);

  return (
    <div
      className={classTrim(`
      char-skills
      ${className ?? ''}
    `)}
    >
      {statList}

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
              onRollDices(
                [
                  {
                    qty: 2,
                    type: 8,
                    offset: skill.score.total,
                  },
                ],
                `skill-${skill.skill._id}`
              );
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CharacterSkills;
