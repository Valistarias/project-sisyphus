import React, { useCallback, useMemo, type FC } from 'react';

import { useForm, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ap, Atitle } from '../../atoms';
import { NumberSelect } from '../../molecules';
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
    handleSubmit,
    setError,
    setValue,
    unregister,
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

  console.log('globalVars', globalVars);

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
      <div className="characterCreation-step2__stats">
        {stats.map(({ stat }) => (
          <div key={stat._id} className="characterCreation-step2__stats__field">
            <NumberSelect
              inputName={`stats.${stat._id}`}
              control={control}
              minimum={globalVars.minPoints ?? 0}
            />
            <div className="characterCreation-step2__stats__content">
              <Atitle className="characterCreation-step2__stats__content__title" level={2}>
                {stat.title}
              </Atitle>
              <RichTextElement
                className="characterCreation-step2__stats__content__text"
                rawStringContent={stat.summary}
                readOnly
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterCreationStep2;
