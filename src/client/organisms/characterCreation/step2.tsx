import React, { useCallback, useMemo, type FC, type ReactNode } from 'react';

import { motion } from 'framer-motion';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ap, Atitle } from '../../atoms';
import { Button, Helper, NumberSelect } from '../../molecules';
import { type ICuratedStat } from '../../types';
import { RichTextElement } from '../richTextElement';

import { arrSum, classTrim, getCyberFrameLevelsByNodes } from '../../utils';

import './characterCreation.scss';

interface FormValues {
  stats: Record<string, number>;
}

interface ICharacterCreationStep2 {
  /** When the user click send and the data is send perfectly */
  onSubmitCyberFrame: (
    stats: Array<{
      id: string;
      value: number;
    }>
  ) => void;
}

const CharacterCreationStep2: FC<ICharacterCreationStep2> = ({ onSubmitCyberFrame }) => {
  const { t } = useTranslation();
  const { stats, globalValues, cyberFrames, character } = useGlobalVars();

  const createDefaultData = useCallback((stats: ICuratedStat[]) => {
    if (stats.length === 0) {
      return {};
    }
    const defaultData: Partial<FormValues> = {};

    stats.forEach(({ stat }) => {
      if (defaultData.stats === undefined) {
        defaultData.stats = {};
      }
      defaultData.stats[stat._id] = 2;
    });

    return defaultData;
  }, []);

  const onSaveStats: SubmitHandler<FormValues> = useCallback(
    ({ stats }) => {
      if (onSubmitCyberFrame !== undefined) {
        onSubmitCyberFrame(
          Object.keys(stats).map((statKey) => ({
            id: statKey,
            value: stats[statKey],
          }))
        );
      }
    },
    [onSubmitCyberFrame]
  );

  const { handleSubmit, watch, control } = useForm<FieldValues>({
    defaultValues: useMemo(() => createDefaultData(stats), [createDefaultData, stats]),
  });

  const globalVars = useMemo(
    () => ({
      basePoints: Number(globalValues.find(({ name }) => name === 'baseStatPoints')?.value ?? 0),
      minPoints: Number(globalValues.find(({ name }) => name === 'minStatAtCreation')?.value ?? 0),
    }),
    [globalValues]
  );

  // Only send CyberFrame bonuses for thwe moment
  // TODO : When level uyp / death, reuse this function more globally
  const bonusesByStat = useMemo(() => {
    if (character === null || character === false) {
      return [];
    }

    const nodesByCyberFrames = getCyberFrameLevelsByNodes(character.nodes, cyberFrames);

    const statBonuses: Record<
      string,
      {
        bonus: number;
        source: string;
        sourceId: string;
        broad: boolean;
      }
    > = {};

    // If only one source for the list, we'll be precise
    // If multiple sources for bonuses, we are borad in the phrasing
    nodesByCyberFrames.forEach(({ cyberFrame, chosenNodes }) => {
      chosenNodes.forEach((node) => {
        if (node.statBonuses !== undefined && node.statBonuses.length > 0) {
          node.statBonuses.forEach((statBonus) => {
            if (statBonuses[statBonus.stat] === undefined) {
              statBonuses[statBonus.stat] = {
                bonus: statBonus.value,
                source: cyberFrame.cyberFrame.title,
                sourceId: cyberFrame.cyberFrame._id,
                broad: false,
              };
            } else {
              statBonuses[statBonus.stat].bonus += statBonus.value;
              if (statBonuses[statBonus.stat].sourceId !== cyberFrame.cyberFrame._id) {
                statBonuses[statBonus.stat].broad = true;
              }
            }
          });
        }
      });
    });

    return statBonuses;
  }, [character, cyberFrames]);

  const pointSpent = arrSum(Object.values(watch('stats') as Record<string, number>) ?? []);
  const pointsLeft = globalVars.basePoints - pointSpent;

  const statSelectList = (): ReactNode[] => {
    const cStatElts: ReactNode[] = [];
    let statBlock: ReactNode[] = [];
    stats.forEach(({ stat }, index) => {
      const valStat = watch(`stats.${stat._id}`);
      const valMod = valStat + (bonusesByStat[stat._id]?.bonus ?? 0) - 5;
      statBlock.push(
        <div key={stat._id} className="characterCreation-step2__stats__field">
          <NumberSelect
            inputName={`stats.${stat._id}`}
            control={control}
            minimum={globalVars.minPoints ?? 0}
            maximum={8}
            maxed={pointsLeft === 0}
            offset={bonusesByStat[stat._id]?.bonus}
          />
          <div className="characterCreation-step2__stats__content">
            <Atitle className="characterCreation-step2__stats__content__title" level={3}>
              {stat.title}
              <Helper>
                <RichTextElement rawStringContent={stat.summary} readOnly />
              </Helper>
            </Atitle>
            {bonusesByStat[stat._id] !== undefined ? (
              <Ap className="characterCreation-step2__stats__content__bonus">
                {bonusesByStat[stat._id].broad === true
                  ? t('characterCreation.step2.generalBonus', {
                      ns: 'components',
                      points: bonusesByStat[stat._id].bonus,
                    })
                  : t('characterCreation.step2.cFrameBonus', {
                      ns: 'components',
                      points: bonusesByStat[stat._id].bonus,
                      cFrameName: bonusesByStat[stat._id].source,
                    })}
              </Ap>
            ) : null}
            <Ap className="characterCreation-step2__stats__content__text">
              <span className="characterCreation-step2__stats__content__text__title">
                {t(
                  `terms.stat.descriptions.${stat.title.toLowerCase()}-${valStat + (bonusesByStat[stat._id]?.bonus ?? 0)}.title`
                )}
              </span>
              {t(
                `terms.stat.descriptions.${stat.title.toLowerCase()}-${valStat + (bonusesByStat[stat._id]?.bonus ?? 0)}.text`
              )}
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
              <Ap className="characterCreation-step2__points__value">
                {globalVars.basePoints - pointSpent}
              </Ap>
              <Button
                theme="afterglow"
                type="submit"
                className="characterCreation-step2__points__btn"
                disabled={pointsLeft !== 0}
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
  };

  return (
    <motion.div
      className={classTrim(`
        characterCreation-step2
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
      transition={{ ease: 'easeOut', duration: 0.3 }}
    >
      <Ap className="characterCreation-step2__text">
        {t('characterCreation.step2.text', { ns: 'components' })}
      </Ap>
      <Ap className="characterCreation-step2__sub">
        {t('characterCreation.step2.sub', { ns: 'components' })}
      </Ap>
      <form
        className="characterCreation-step2__stats"
        onSubmit={handleSubmit(onSaveStats)}
        noValidate
      >
        {statSelectList()}
      </form>
    </motion.div>
  );
};

export default CharacterCreationStep2;
