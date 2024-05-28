import React, { useMemo, type FC, type ReactNode } from 'react';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ali, Ap, Atitle, Aul } from '../../atoms';
import { Helper } from '../../molecules';
import { aggregateSkillsByStats, calculateStatMod, getActualBody } from '../../utils/character';
import { RichTextElement } from '../richTextElement';

import { classTrim } from '../../utils';

import './characterCreation.scss';

interface ICharacterCreationStep2 {
  /** When the user click send and the data is send perfectly */
  onSubmitSkills: (skills: string[]) => void;
}

const CharacterCreationStep2: FC<ICharacterCreationStep2> = ({ onSubmitSkills }) => {
  const { t } = useTranslation();
  const { skills, stats, globalValues, cyberFrames, character } = useGlobalVars();

  const aggregatedSkills = useMemo(() => aggregateSkillsByStats(skills, stats), [skills, stats]);

  const statBlocks = useMemo(() => {
    if (character === null || character === false) {
      return [];
    }
    const relevantBody = getActualBody(character);
    if (relevantBody.body === undefined || relevantBody.duplicate) {
      return [];
    }
    const statElts: ReactNode[] = [];
    aggregatedSkills.forEach(({ stat, skills }) => {
      if (relevantBody.body !== undefined) {
        const relevantCharacterData = relevantBody.body.stats.find(
          ({ stat: bodyStat }) => bodyStat === stat.stat._id
        );
        const valMod = calculateStatMod(Number(relevantCharacterData?.value));
        statElts.push(
          <div key={stat.stat._id} className="characterCreation-step3__stat-block">
            <div className="characterCreation-step3__stat-block__title">
              <Atitle className="characterCreation-step2__stats__content__title" level={3}>
                {stat.stat.title}
                {/* <Helper size="small">
                  <RichTextElement rawStringContent={stat.stat.summary} readOnly />
                </Helper> */}
              </Atitle>
              <Ap className="characterCreation-step3__stat-block__mod">
                {`${t('terms.general.modifierShort')}: `}
                <span
                  className={classTrim(`
                      characterCreation-step3__stat-block__mod__value
                      ${valMod < 0 ? 'characterCreation-step3__stat-block__mod__value--negative' : ''}
                      ${valMod > 0 ? 'characterCreation-step3__stat-block__mod__value--positive' : ''}
                    `)}
                >
                  {valMod}
                </span>
              </Ap>
            </div>
            <Aul noPoints className="characterCreation-step3__stat-block__content">
              {skills.map(({ skill }) => {
                const skillVal = valMod;
                return (
                  <Ali
                    key={skill._id}
                    className="characterCreation-step3__stat-block__content__elt"
                  >
                    <span className="characterCreation-step3__stat-block__content__name">
                      {skill.title}
                      <Helper size="small" theme="text-only">
                        <RichTextElement rawStringContent={skill.summary} readOnly />
                      </Helper>
                    </span>
                    <span
                      className={classTrim(`
                        characterCreation-step3__stat-block__content__value
                        ${skillVal < 0 ? 'characterCreation-step3__stat-block__content__value--negative' : ''}
                        ${skillVal > 0 ? 'characterCreation-step3__stat-block__content__value--positive' : ''}
                      `)}
                    >
                      {skillVal}
                    </span>
                  </Ali>
                );
              })}
            </Aul>
          </div>
        );
      }
    });
    return statElts;
  }, [aggregatedSkills, character, t]);

  console.log('aggregatedSkills', aggregatedSkills);

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
        transitionEnd: {
          transform: 'none',
        },
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
      <div className="characterCreation-step3__list">{statBlocks}</div>
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
