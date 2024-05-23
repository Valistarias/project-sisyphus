import React, { type FC } from 'react';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ap } from '../../atoms';

import { classTrim } from '../../utils';

import './characterCreation.scss';

interface ICharacterCreationStep2 {
  /** When the user click send and the data is send perfectly */
  onSubmitSkills: (skills: string[]) => void;
}

const CharacterCreationStep2: FC<ICharacterCreationStep2> = ({ onSubmitSkills }) => {
  const { t } = useTranslation();
  const { stats, globalValues, cyberFrames, character } = useGlobalVars();

  console.log('character', character);
  return (
    <motion.div
      className={classTrim(`
        characterCreation-step3
      `)}
      initial={{
        transform: 'skew(90deg, 0deg) scale3d(.2, .2, .2)',
      }}
      animate={{
        transform: 'skew(0, 0) scale3d(1, 1, 1)',
      }}
      exit={{
        transform: 'skew(-90deg, 0deg) scale3d(.2, .2, .2)',
      }}
      transition={{ ease: 'easeInOut', duration: 0.2 }}
    >
      <Ap className="characterCreation-step3__text">
        {t('characterCreation.step3.text', { ns: 'components' })}
      </Ap>
      <Ap className="characterCreation-step3__sub">
        {t('characterCreation.step3.sub', { ns: 'components' })}
      </Ap>
      {/* <form
        className="characterCreation-step3__stats"
        onSubmit={handleSubmit(onSaveStats)}
        noValidate
      >
        {statSelectList()}
      </form> */}
    </motion.div>
  );
};

export default CharacterCreationStep2;
