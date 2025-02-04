import React, { useMemo, useState, type FC } from 'react';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TypeAnimation } from 'react-type-animation';

import { useGlobalVars } from '../../providers';

import { Aicon } from '../../atoms';
import { LinkButton } from '../../molecules';

import type { ICuratedCyberFrame } from '../../types';

import { classTrim, getCyberFrameLevelsByNodes } from '../../utils';

import './characterCreation.scss';

const CharacterCreationStep7: FC = () => {
  const { t } = useTranslation();
  const { character, cyberFrames } = useGlobalVars();

  const [displayNext, setDisplayNext] = useState<boolean>(false);

  const chosenCyberFrame = useMemo<ICuratedCyberFrame | null>(() => {
    if (character === null || character === false) {
      return null;
    }

    return getCyberFrameLevelsByNodes(character.nodes, cyberFrames)[0]?.cyberFrame;
  }, [character, cyberFrames]);

  let name = '';
  let id = '';
  if (character !== null && character !== false) {
    name = `${character.firstName ?? ''} ${character.nickName !== undefined ? `"${character.nickName}" ` : ''}${character.lastName ?? ''}`;
    id = character._id;
  }

  return (
    <motion.div
      className={classTrim(`
        characterCreation-step7
        ${displayNext ? 'characterCreation-step7--next' : ''}
      `)}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transitionEnd: { transform: 'none' },
      }}
      exit={{ opacity: 0 }}
      transition={{
        ease: 'easeInOut',
        duration: 0.2,
      }}
    >
      <div className="characterCreation-step7__logo">
        <Aicon className="characterCreation-step7__logo__elt" type="Eidolon" size="unsized" />
      </div>
      <TypeAnimation
        className="characterCreation-step7__text"
        sequence={[
          1000,
          t('characterCreation.step7.text.name', {
            ns: 'components',
            name,
          }),
          500,
          `${t('characterCreation.step7.text.name', {
            ns: 'components',
            name,
          })}\n${t('characterCreation.step7.text.cyberFrame', {
            ns: 'components',
            cyberFrame: chosenCyberFrame?.cyberFrame.title,
          })}`,
          1000,
          `${t('characterCreation.step7.text.name', {
            ns: 'components',
            name,
          })}\n${t('characterCreation.step7.text.cyberFrame', {
            ns: 'components',
            cyberFrame: chosenCyberFrame?.cyberFrame.title,
          })}\n${t('characterCreation.step7.text.cyberFrameR', { ns: 'components' })}`,
          300,
          `${t('characterCreation.step7.text.name', {
            ns: 'components',
            name,
          })}\n${t('characterCreation.step7.text.cyberFrame', {
            ns: 'components',
            cyberFrame: chosenCyberFrame?.cyberFrame.title,
          })}\n${t('characterCreation.step7.text.cyberFrameR', { ns: 'components' })}\n${t('characterCreation.step7.text.psa', { ns: 'components' })}`,
          () => {
            setDisplayNext(true);
          },
        ]}
        speed={70}
        omitDeletionAnimation={true}
        style={{ whiteSpace: 'pre-line' }}
      />
      <LinkButton
        className="characterCreation-step7__next-btn"
        href={`/character/${id}`}
        size="large"
      >
        {t('characterCreation.step7.text.next', { ns: 'components' })}
      </LinkButton>
    </motion.div>
  );
};

export default CharacterCreationStep7;
