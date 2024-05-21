import React, { useCallback, useMemo, type FC, type ReactNode } from 'react';

import { useForm, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ap, Atitle } from '../../atoms';
import { Button, Helper, NumberSelect } from '../../molecules';
import { type ICuratedStat } from '../../types';
import { RichTextElement } from '../richTextElement';

import { classTrim } from '../../utils';

import './characterCreation.scss';

interface FormValues {
  stats: Record<string, number>;
}

interface ICharacterCreationStep2 {
  /** When the user click send and the data is send perfectly */
  onSubmitCyberFrame: (id: string) => void;
}

const CharacterCreationStep2: FC<ICharacterCreationStep2> = ({ onSubmitCyberFrame }) => {
  const { t } = useTranslation();
  const { stats, globalValues } = useGlobalVars();

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

  const {
    watch,
    control,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: useMemo(() => createDefaultData(stats), [createDefaultData, stats]),
  });

  const globalVars = useMemo(
    () => ({
      basePoints: Number(globalValues.find(({ name }) => name === 'baseStatPoints')?.value ?? 0),
      minPoints: Number(globalValues.find(({ name }) => name === 'minStatAtCreation')?.value ?? 0),
    }),
    [globalValues]
  );

  const statSelectList = (): ReactNode[] => {
    const cStatElts: ReactNode[] = [];
    let statBlock: ReactNode[] = [];
    stats.forEach(({ stat }, index) => {
      const valMod = watch(`stats.${stat._id}`) - 5;
      statBlock.push(
        <div key={stat._id} className="characterCreation-step2__stats__field">
          <NumberSelect
            inputName={`stats.${stat._id}`}
            control={control}
            minimum={globalVars.minPoints ?? 0}
          />
          <div className="characterCreation-step2__stats__content">
            <div className="characterCreation-step2__stats__content__title-block">
              <Atitle className="characterCreation-step2__stats__content__title" level={3}>
                {stat.title}
                <Helper>
                  <RichTextElement rawStringContent={stat.summary} readOnly />
                </Helper>
              </Atitle>
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
            <Ap className="characterCreation-step2__stats__content__text">Henlo</Ap>
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
              <Ap className="characterCreation-step2__points__value">{10}</Ap>
              <Button
                theme="afterglow"
                className="characterCreation-step2__points__btn"
                onClick={() => {
                  console.log('clicked');
                }}
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
      <div className="characterCreation-step2__stats">{statSelectList()}</div>
    </div>
  );
};

export default CharacterCreationStep2;
