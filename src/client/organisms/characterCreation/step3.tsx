import React, { useCallback, useEffect, useMemo, type FC, type ReactNode } from 'react';

import { motion } from 'framer-motion';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ali, Ap, Atitle, Aul } from '../../atoms';
import { Button, Helper, NumberSelect } from '../../molecules';
import {
  aggregateSkillsByStats,
  calculateStatMod,
  curateCharacterBody,
  getActualBody,
} from '../../utils/character';
import { RichTextElement } from '../richTextElement';

import type { ICharacter, ICuratedBody, ICuratedSkill, ICuratedStat } from '../../types';

import { arrSum, classTrim, getValuesFromGlobalValues } from '../../utils';

import './characterCreation.scss';

interface FormValues {
  skills: Record<string, number>;
}

interface ICharacterCreationStep3 {
  /** When the user click send and the data is send perfectly */
  onSubmitSkills?: (
    skills: Array<{
      id: string;
      value: number;
    }>
  ) => void;
}

const CharacterCreationStep3: FC<ICharacterCreationStep3> = ({ onSubmitSkills }) => {
  const { t } = useTranslation();
  const { skills, globalValues, character, cyberFrames, charParams, stats } = useGlobalVars();
  const createDefaultData = useCallback(
    (skills: ICuratedSkill[], character: ICharacter | null | false) => {
      if (skills.length === 0) {
        return {};
      }
      const defaultData: Partial<FormValues> = {};
      if (character !== null && character !== false) {
        const { body } = getActualBody(character);

        skills.forEach(({ skill }) => {
          if (defaultData.skills === undefined) {
            defaultData.skills = {};
          }
          defaultData.skills[skill._id] = 0;

          if (body !== undefined) {
            const foundBodySkill = body.skills.find((bodySkill) => bodySkill.skill === skill._id);
            if (foundBodySkill !== undefined) {
              defaultData.skills[skill._id] += foundBodySkill.value;
            }
          }
        });
      }

      return defaultData;
    },
    []
  );

  const onSaveSkills: SubmitHandler<FormValues> = useCallback(
    ({ skills }) => {
      if (onSubmitSkills !== undefined) {
        onSubmitSkills(
          Object.keys(skills).map((skillKey) => ({
            id: skillKey,
            value: skills[skillKey] ?? 0,
          }))
        );
      }
    },
    [onSubmitSkills]
  );

  const mainBody = useMemo<ICuratedBody | null>(() => {
    if (character === null || character === false) {
      return null;
    }

    const { body } = getActualBody(character);

    if (body === undefined) {
      return null;
    }

    return curateCharacterBody({ body, cyberFrames, charParams, stats });
  }, [character, cyberFrames, charParams, stats]);

  const { handleSubmit, watch, control } = useForm({
    defaultValues: useMemo(
      () => createDefaultData(skills, character),
      [createDefaultData, skills, character]
    ),
  });

  const aggregatedSkills = useMemo(() => aggregateSkillsByStats(skills, stats), [skills, stats]);

  const { nbBeginningSkills } = useMemo(
    () => getValuesFromGlobalValues(['nbBeginningSkills'], globalValues),
    [globalValues]
  );

  const watchedSkills = watch();

  const pointSpend = useMemo(() => {
    const pointResume: {
      byStats: Array<{
        stat: ICuratedStat;
        cyberFramePoints: number;
        spent: number;
      }>;
      generalSpent: number;
      generalLeft: number;
    } = {
      byStats: [],
      generalSpent: 0,
      generalLeft: nbBeginningSkills ?? 0,
    };
    if (watchedSkills.skills !== undefined) {
      stats.forEach((stat) => {
        const statObj = {
          stat,
          cyberFramePoints: 0,
          spent: 0,
        };
        if (mainBody !== null) {
          const foundBonus = mainBody.cyberFrame.cyberFrame.stats.find(
            (cFrameStat) => cFrameStat.stat.stat._id === stat.stat._id
          );
          if (foundBonus !== undefined) {
            statObj.cyberFramePoints += foundBonus.value;
          }
        }
        Object.keys(watchedSkills.skills!).forEach((skillId) => {
          const foundSkill = skills.find((skill) => skill.skill._id === skillId);
          const valueSkill = watchedSkills.skills![skillId];
          if (foundSkill !== undefined && foundSkill.skill.stat._id === stat.stat._id) {
            statObj.spent += valueSkill;
          }
        });
        if (statObj.spent > statObj.cyberFramePoints) {
          pointResume.generalSpent += statObj.spent - statObj.cyberFramePoints;
        }
        pointResume.byStats.push(statObj);
      });
    }
    pointResume.generalLeft -= pointResume.generalSpent;

    return pointResume;
  }, [nbBeginningSkills, watchedSkills, stats, mainBody, skills]);

  const statBlocks = useMemo(() => {
    if (character === null || character === false) {
      return [];
    }
    const statElts: ReactNode[] = [];
    aggregatedSkills.forEach(({ stat, skills }) => {
      const relevantCharacterData = character.stats.find(
        ({ stat: bodyStat }) => bodyStat === stat.stat._id
      );
      const relevantPointSpent = pointSpend.byStats.find(
        (byStat) => byStat.stat.stat._id === stat.stat._id
      );
      let localPointUsed = 0;
      if (relevantPointSpent !== undefined) {
        localPointUsed = relevantPointSpent.cyberFramePoints - relevantPointSpent.spent;
      }
      if (localPointUsed < 0) {
        localPointUsed = 0;
      }

      const valMod = calculateStatMod(relevantCharacterData?.value ?? 0);
      statElts.push(
        <div key={stat.stat._id} className="characterCreation-step3__stat-block">
          <div className="characterCreation-step3__stat-block__title">
            <Atitle className="characterCreation-step3__stat-block__title__elt" level={3}>
              {stat.stat.title}
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
          {relevantPointSpent !== undefined && relevantPointSpent.cyberFramePoints > 0 ? (
            <Ap className="characterCreation-step3__stat-block__bonus">
              {t('characterCreation.step3.bonusFramePoints', { ns: 'components' })}
              <span className="characterCreation-step3__stat-block__bonus__score">
                {localPointUsed}
              </span>
            </Ap>
          ) : null}

          <Aul noPoints className="characterCreation-step3__stat-block__content">
            {skills.map((skill) => (
              <Ali
                key={skill.skill._id}
                className={classTrim(`
                    characterCreation-step3__stat-block__content__elt
                  `)}
              >
                <span className="characterCreation-step3__stat-block__content__name">
                  {skill.skill.title}
                  <Helper size="small" theme="text-only">
                    <RichTextElement rawStringContent={skill.skill.summary} readOnly />
                  </Helper>
                </span>
                <NumberSelect
                  inputName={`skills.${skill.skill._id}`}
                  control={control}
                  minimum={0}
                  offset={valMod}
                  maximum={9}
                  theme="horizontal"
                  maxed={pointSpend.generalLeft === 0 && localPointUsed === 0}
                />
              </Ali>
            ))}
          </Aul>
        </div>
      );
      if (statElts.length === 1) {
        statElts.push(
          <div key="block-stat-points" className="characterCreation-step3__points">
            <Ap className="characterCreation-step3__points__text">
              {t('characterCreation.step3.pointsLeft', { ns: 'components' })}
            </Ap>
            <Ap className="characterCreation-step3__points__value">{pointSpend.generalLeft}</Ap>
            <Button
              type="submit"
              className="characterCreation-step3__points__btn"
              disabled={
                pointSpend.generalLeft !== 0 ||
                arrSum(
                  pointSpend.byStats.map((byStat) =>
                    byStat.cyberFramePoints > byStat.spent ? 1 : 0
                  )
                ) !== 0
              }
              theme="text-only"
            >
              {t('characterCreation.step3.next', { ns: 'components' })}
            </Button>
          </div>
        );
      }
    });

    return statElts;
  }, [character, aggregatedSkills, pointSpend.byStats, pointSpend.generalLeft, t, control]);

  useEffect(() => {
    if (
      character !== null &&
      character !== false &&
      character.nodes !== undefined &&
      character.nodes.length > 1
    ) {
      // setSelectedSkills(skillIds);
    }
  }, [character, skills]);

  return (
    <motion.div
      className={classTrim(`
        characterCreation-step3
      `)}
      initial={{ transform: 'skew(80deg, 0deg) scale3d(.2, .2, .2)' }}
      animate={{
        transform: 'skew(0, 0) scale3d(1, 1, 1)',
        transitionEnd: { transform: 'none' },
      }}
      exit={{ transform: 'skew(-80deg, 0deg) scale3d(.2, .2, .2)' }}
      transition={{
        ease: 'easeInOut',
        duration: 0.2,
      }}
    >
      <Ap className="characterCreation-step3__text">
        {t('characterCreation.step3.text', { ns: 'components' })}
      </Ap>
      <Ap className="characterCreation-step3__sub">
        {t('characterCreation.step3.sub', { ns: 'components' })}
      </Ap>
      <form
        className="characterCreation-step3__list"
        onSubmit={(evt) => {
          void handleSubmit(onSaveSkills)(evt);
        }}
        noValidate
      >
        {statBlocks}
      </form>
    </motion.div>
  );
};

export default CharacterCreationStep3;
