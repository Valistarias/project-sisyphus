import React, { useMemo, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ap } from '../../atoms';
import { SearchBar, SkillDisplay } from '../../molecules';

import type { TypeCampaignEvent } from '../../types';

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
  const { characterStatSkills } = useGlobalVars();

  const [searchWord, setSearchWord] = useState('');

  const sortedSkillList = useMemo(() => {
    if (characterStatSkills === undefined || characterStatSkills.skills.length === 0) {
      return [];
    }

    // TODO: Handle i18n here
    const textField = 'skill';
    const searchElt = removeDiacritics(searchWord).toLowerCase();

    const filteredBySearch = characterStatSkills.skills.filter((skill) => {
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
  }, [characterStatSkills, searchWord]);

  return (
    <div
      className={classTrim(`
      char-skills
      ${className ?? ''}
    `)}
    >
      <Ap className="char-skills__title">{t('terms.skill.name', { count: 2 })}</Ap>
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
                    type: 10,
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
