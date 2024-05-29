import React, { type FC } from 'react';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { Ap } from '../../atoms';

import { classTrim } from '../../utils';

import './characterCreation.scss';

interface ICharacterCreationStep4 {
  /** When the user click send and the data is send perfectly */
  onSubmitBackground: (id: string) => void;
}

const CharacterCreationStep4: FC<ICharacterCreationStep4> = ({ onSubmitBackground }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      className={classTrim(`
        characterCreation-step4
      `)}
      initial={{
        transform: 'skew(90deg, 0deg) scale3d(.2, .2, .2)',
      }}
      animate={{
        transform: 'skew(0, 0) scale3d(1, 1, 1)',
        transitionEnd: {
          transform: 'none',
        },
      }}
      exit={{
        transform: 'skew(-90deg, 0deg) scale3d(.2, .2, .2)',
      }}
      transition={{ ease: 'easeInOut', duration: 0.2 }}
    >
      <Ap className="characterCreation-step4__text">
        {t('characterCreation.step4.text', { ns: 'components' })}
      </Ap>
      <Ap className="characterCreation-step4__sub">
        {t('characterCreation.step4.sub', { ns: 'components' })}
      </Ap>
    </motion.div>
  );
};

export default CharacterCreationStep4;
