import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ap } from '../../atoms';
import { curateCharacterSkills } from '../../utils/character';

import { classTrim, type DiceRequest } from '../../utils';

import './characterSkills.scss';

interface ICharacterSkills {
  /** The function sent to roll the dices */
  onRollDices: (diceValues: DiceRequest[]) => void;
}

const CharacterSkills: FC<ICharacterSkills> = () => {
  const { t } = useTranslation();
  const { character, skills, stats } = useGlobalVars();

  const aggregatedSkills = useMemo(
    () => curateCharacterSkills(character, skills, stats),
    [character, skills, stats]
  );

  console.log('aggregatedSkills', aggregatedSkills);

  return (
    <div
      className={classTrim(`
        char-skills
      `)}
    >
      <Ap>Henlo</Ap>
    </div>
  );
};

export default CharacterSkills;
