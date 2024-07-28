import React, { useMemo, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { SearchBar, StatDisplay } from '../../molecules';
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

  return (
    <div
      className={classTrim(`
      char-skills
      ${className ?? ''}
    `)}
    >
      <div className="char-skills__stats">
        {aggregatedSkills.map(({ stat }) => (
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
    </div>
  );
};

export default CharacterSkills;
