import React, { useEffect, useMemo, useState, type FC } from 'react';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Abutton, Aicon, Ali, Ap, Atitle, Aul } from '../../atoms';
import { Button } from '../../molecules';
import { RichTextElement } from '../richTextElement';

import type { ICuratedBackground } from '../../types';

import { classTrim } from '../../utils';

import './characterCreation.scss';

interface ICharacterCreationStep4 {
  /** All the available backgrounds */
  backgrounds: ICuratedBackground[];
  /** When the user click send and the data is send perfectly */
  onSubmitBackground: (id: string) => void;
}

const CharacterCreationStep4: FC<ICharacterCreationStep4> = ({
  backgrounds,
  onSubmitBackground,
}) => {
  const { t } = useTranslation();
  const { skills, character } = useGlobalVars();
  const [selectedBg, setSelectedBg] = useState<ICuratedBackground | null>(null);

  const bonuses = useMemo(() => {
    const bonuses = selectedBg?.background.skillBonuses?.map((skillBonus) => ({
      ...skillBonus,
      skill: skills.find((skill) => skill.skill._id === skillBonus.skill),
    }));

    return (
      <Aul noPoints className="characterCreation-step4__view__chosen-background__bonuses">
        {bonuses?.map((bonus) => (
          <Ali
            className="characterCreation-step4__view__chosen-background__bonuses__elt"
            key={bonus._id}
          >
            {`+${bonus.value} ${bonus.skill?.skill.title}`}
          </Ali>
        ))}
      </Aul>
    );
  }, [selectedBg, skills]);

  useEffect(() => {
    if (
      backgrounds.length > 0 &&
      character !== null &&
      character !== false &&
      character.background !== undefined &&
      selectedBg === null
    ) {
      const findBg = backgrounds.find(
        ({ background }) => background._id === character.background?._id
      );
      if (findBg !== undefined) {
        setSelectedBg(findBg);
      } else {
        setSelectedBg(backgrounds[0]);
      }
    } else if (backgrounds.length > 0 && selectedBg === null) {
      setSelectedBg(backgrounds[0]);
    }
  }, [backgrounds, selectedBg, character]);

  return (
    <motion.div
      className={classTrim(`
        characterCreation-step4
      `)}
      initial={{ transform: 'skew(90deg, 0deg) scale3d(.2, .2, .2)' }}
      animate={{
        transform: 'skew(0, 0) scale3d(1, 1, 1)',
        transitionEnd: { transform: 'none' },
      }}
      exit={{ transform: 'skew(-90deg, 0deg) scale3d(.2, .2, .2)' }}
      transition={{
        ease: 'easeInOut',
        duration: 0.2,
      }}
    >
      <Ap className="characterCreation-step4__text">
        {t('characterCreation.step4.text', { ns: 'components' })}
      </Ap>
      <Ap className="characterCreation-step4__sub">
        {t('characterCreation.step4.sub', { ns: 'components' })}
      </Ap>
      <div className="characterCreation-step4__view">
        <Aul noPoints className="characterCreation-step4__view__list">
          <Ali className="characterCreation-step4__view__list__title">Choose one</Ali>
          {backgrounds.map((background) => (
            <Ali
              key={background.background._id}
              className={classTrim(`
                characterCreation-step4__view__list__elt
                ${selectedBg?.background._id === background.background._id ? 'characterCreation-step4__view__list__elt--active' : ''}
              `)}
            >
              <Abutton
                className="characterCreation-step4__view__list__elt__btn"
                onClick={() => {
                  setSelectedBg(background);
                }}
              >
                {background.background.title}
                <Aicon
                  type="Arrow"
                  className="characterCreation-step4__view__list__elt__btn__arrow"
                />
              </Abutton>
            </Ali>
          ))}
        </Aul>
        <div className="characterCreation-step4__view__chosen-background">
          <div className="characterCreation-step4__view__chosen-background__content">
            <Atitle className="characterCreation-step4__view__chosen-background__title" level={2}>
              {selectedBg?.background.title}
            </Atitle>
            {bonuses}
            <RichTextElement
              className="characterCreation-step4__view__chosen-background__text"
              rawStringContent={selectedBg?.background.summary}
              readOnly
            />
          </div>
          <Button
            onClick={() => {
              if (selectedBg?.background._id !== undefined) {
                onSubmitBackground(selectedBg.background._id);
              }
            }}
            size="large"
            className="characterCreation-step4__view__chosen-background__btn"
          >
            {t('characterCreation.step4.select', { ns: 'components' })}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CharacterCreationStep4;
