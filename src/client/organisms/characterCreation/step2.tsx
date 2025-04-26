import React, { useCallback, useMemo, type FC, type ReactNode } from 'react';

import { motion } from 'framer-motion';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ap, Atitle } from '../../atoms';
import { Button, Helper, NumberSelect } from '../../molecules';
import { calculateStatMod } from '../../utils/character';
import { RichTextElement } from '../richTextElement';

import type { ICharacter, ICuratedStat } from '../../types';

import { arrSum, classTrim, getValuesFromGlobalValues } from '../../utils';

import './characterCreation.scss';

interface FormValues {
  stats: Record<string, number>;
}

export interface IStatBonuses {
  bonus: number;
  source: string;
  sourceId: string;
  broad: boolean;
}

interface ICharacterCreationStep2 {
  /** When the user click send and the data is send perfectly */
  onSubmitStats?: (
    stats: Array<{
      id: string;
      value: number;
    }>
  ) => void;
}

const CharacterCreationStep2: FC<ICharacterCreationStep2> = ({ onSubmitStats }) => {
  const { t } = useTranslation();
  const { stats, globalValues, character } = useGlobalVars();

  const createDefaultData = useCallback(
    (stats: ICuratedStat[], character: ICharacter | null | false) => {
      if (stats.length === 0) {
        return {};
      }
      const defaultData: Partial<FormValues> = {};
      if (character !== null && character !== false) {
        character.stats.forEach(({ stat, value }) => {
          if (defaultData.stats === undefined) {
            defaultData.stats = {};
          }
          defaultData.stats[stat] = value;
        });
      }

      if (Object.keys(defaultData).length === 0) {
        stats.forEach(({ stat }) => {
          if (defaultData.stats === undefined) {
            defaultData.stats = {};
          }
          defaultData.stats[stat._id] = 0;
        });
      }

      return defaultData;
    },
    []
  );

  const onSaveStats: SubmitHandler<FormValues> = useCallback(
    ({ stats }) => {
      if (onSubmitStats !== undefined) {
        onSubmitStats(
          Object.keys(stats).map((statKey) => ({
            id: statKey,
            value: stats[statKey],
          }))
        );
      }
    },
    [onSubmitStats]
  );

  const { handleSubmit, watch, control } = useForm({
    defaultValues: useMemo(
      () => createDefaultData(stats, character),
      [createDefaultData, stats, character]
    ),
  });

  const { baseStatPoints, minStatAtCreation } = useMemo(
    () => getValuesFromGlobalValues(['baseStatPoints', 'minStatAtCreation'], globalValues),
    [globalValues]
  );

  const watchedStats = watch('stats');

  const pointSpent = arrSum(watchedStats !== undefined ? Object.values(watchedStats) : []);
  const pointsLeft = (baseStatPoints ?? 0) - pointSpent;

  const statSelectList = useCallback((): ReactNode[] => {
    const cStatElts: ReactNode[] = [];
    let statBlock: ReactNode[] = [];
    stats.forEach(({ stat }, index) => {
      const valStat = watch(`stats.${stat._id}`);
      const valMod = calculateStatMod(Number(valStat));
      statBlock.push(
        <div key={stat._id} className="characterCreation-step2__stats__field">
          <NumberSelect
            inputName={`stats.${stat._id}`}
            control={control}
            minimum={minStatAtCreation ?? 0}
            maximum={5}
            maxed={pointsLeft === 0}
          />
          <div className="characterCreation-step2__stats__content">
            <Atitle className="characterCreation-step2__stats__content__title" level={3}>
              {stat.title}
              <Helper>
                <RichTextElement rawStringContent={stat.summary} readOnly />
              </Helper>
            </Atitle>
            <Ap className="characterCreation-step2__stats__content__text">
              <span className="characterCreation-step2__stats__content__text__title">
                {t(`terms.stat.descriptions.${stat.title.toLowerCase()}-${valStat}.title`)}
              </span>
              {t(`terms.stat.descriptions.${stat.title.toLowerCase()}-${valStat}.text`)}
            </Ap>
            <Ap className="characterCreation-step2__stats__content__mod">
              {`${t('terms.general.modifierShort')}: `}
              <span
                className={classTrim(`
                    characterCreation-step2__stats__content__mod__value
                    ${valMod < 0 ? 'characterCreation-step2__stats__content__mod__value--negative' : ''}
                    ${valMod > 0 ? 'characterCreation-step2__stats__content__mod__value--positive' : ''}
                  `)}
              >
                {valMod}
              </span>
            </Ap>
          </div>
        </div>
      );

      if (statBlock.length === Math.trunc(stats.length / 2) || index === stats.length - 1) {
        cStatElts.push(
          <div key={`block-stat-${index}`} className="characterCreation-step2__stats__field-block">
            {statBlock}
          </div>
        );
        if (cStatElts.length === 1) {
          cStatElts.push(
            <div key="block-stat-points" className="characterCreation-step2__points">
              <Ap className="characterCreation-step2__points__text">
                {t('characterCreation.step2.pointsLeft', { ns: 'components' })}
              </Ap>
              <Ap className="characterCreation-step2__points__value">{pointsLeft}</Ap>
              <Button
                type="submit"
                className="characterCreation-step2__points__btn"
                disabled={pointsLeft !== 0}
                theme={pointsLeft !== 0 ? 'text-only' : 'afterglow'}
              >
                {t('characterCreation.step2.next', { ns: 'components' })}
              </Button>
            </div>
          );
        }
        statBlock = [];
      }
    });

    return cStatElts;
  }, [control, minStatAtCreation, pointsLeft, stats, t, watch]);

  return (
    <motion.div
      className={classTrim(`
        characterCreation-step2
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
      <Ap className="characterCreation-step2__text">
        {t('characterCreation.step2.text', { ns: 'components' })}
      </Ap>
      <Ap className="characterCreation-step2__sub">
        {t('characterCreation.step2.sub', { ns: 'components' })}
      </Ap>
      <form
        className="characterCreation-step2__stats"
        onSubmit={(evt) => {
          void handleSubmit(onSaveStats)(evt);
        }}
        noValidate
      >
        {statSelectList()}
      </form>
    </motion.div>
  );
};

export default CharacterCreationStep2;
