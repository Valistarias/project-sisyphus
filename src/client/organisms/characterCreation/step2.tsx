import React, { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ap } from '../../atoms';

import { classTrim } from '../../utils';

import './characterCreation.scss';

interface ICharacterCreationStep2 {
  /** When the user click send and the data is send perfectly */
  onSubmitCyberFrame: (id: string) => void;
}

const CharacterCreationStep2: FC<ICharacterCreationStep2> = ({ onSubmitCyberFrame }) => {
  const { t } = useTranslation();
  const { stats } = useGlobalVars();

  console.log('stats', stats);

  return (
    <div
      className={classTrim(`
      characterCreation-step2
      `)}
    >
      <Ap className="characterCreation-step2__text">
        {t('characterCreation.step2.text', { ns: 'components' })}
      </Ap>
      <Ap className="characterCreation-step2__sub">
        {t('characterCreation.step2.sub', { ns: 'components' })}
      </Ap>
    </div>
  );
};

export default CharacterCreationStep2;
