import React, { useCallback, useEffect, useMemo, type FC } from 'react';

import { type SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  useApi,
  useCampaignEventWindow,
  useGlobalVars,
  useSocket,
  useSystemAlerts,
} from '../../providers';

import { Ap } from '../../atoms';
import { NumDisplay, NumDisplayInput } from '../../molecules';
import {
  calculateStatMod,
  calculateStatModToString,
  getActualBody,
  getCharacterHpValues,
  malusStatMod,
} from '../../utils/character';
import Alert from '../alert';

import type { ErrorResponseType, TypeCampaignEvent } from '../../types';

import { addSymbol, classTrim, type DiceRequest } from '../../utils';

import './characterStats.scss';

interface ICharacterStats {
  /** The function sent to roll the dices */
  onRollDices: (diceValues: DiceRequest[], id: TypeCampaignEvent) => void;
  /** The classname of the element */
  className?: string;
}

interface FormHpValues {
  hp: number;
}

const CharacterStats: FC<ICharacterStats> = ({ className, onRollDices }) => {
  const { t } = useTranslation();
  const {
    character,
    setCharacterFromId,
    globalValues,
    charParams,
    characterStatSkills,
    characterParams,
  } = useGlobalVars();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { socket } = useSocket();
  const { dispatchCampaignEvent } = useCampaignEventWindow();

  const hpValues = useMemo(
    () =>
      getCharacterHpValues(
        character,
        Number(globalValues.find(({ name }) => name === 'baseHp')?.value ?? 0),
        charParams.find(({ charParam }) => charParam.short === 'HP')?.charParam._id ?? undefined
      ),
    [character, globalValues, charParams]
  );

  const {
    handleSubmit: handleSubmitHp,
    control: controlHp,
    reset: resetHp,
  } = useForm({
    defaultValues: useMemo(() => ({ hp: hpValues.isLoading ? 0 : hpValues.hp }), [hpValues]),
  });

  const statList = useMemo(
    () => (
      <div className="char-stats__caracs">
        {characterStatSkills?.stats.map((stat) => {
          // TODO: Deal with i18n here
          const { title, summary, short } = stat.stat;

          return (
            <NumDisplay
              key={stat.stat._id}
              stat={stat}
              text={{
                title,
                summary,
                short,
              }}
              value={calculateStatModToString(stat.score.total)}
              bonuses={[
                ...stat.score.sources,
                {
                  fromThrottleStat: true,
                  value: malusStatMod,
                },
              ]}
              onClick={() => {
                onRollDices(
                  [
                    {
                      qty: 2,
                      type: 10,
                      offset: calculateStatMod(stat.score.total),
                    },
                  ],
                  `stat-${stat.stat._id}`
                );
              }}
            />
          );
        })}
      </div>
    ),
    [characterStatSkills, onRollDices]
  );

  const charParamList = useMemo(
    () => (
      <div className="char-stats__char-params">
        {characterParams?.map((charParam) => {
          // TODO: Deal with i18n here
          const { title, summary, short } = charParam.charParam;

          return (
            <NumDisplay
              key={charParam.charParam._id}
              stat={charParam.stat}
              text={{
                title,
                summary,
                short,
              }}
              value={
                charParam.charParam.formulaId === 'ini'
                  ? addSymbol(charParam.score.total)
                  : String(charParam.score.total)
              }
              bonuses={charParam.score.sources}
              onClick={
                charParam.charParam.formulaId === 'ini'
                  ? () => {
                      onRollDices(
                        [
                          {
                            qty: 2,
                            type: 10,
                            offset: charParam.score.total,
                          },
                        ],
                        'init'
                      );
                    }
                  : undefined
              }
            />
          );
        })}
      </div>
    ),
    [characterParams, onRollDices]
  );

  const onSaveHp: SubmitHandler<FormHpValues> = useCallback(
    ({ hp }) => {
      if (api === undefined || character === null || character === false || socket === null) {
        return;
      }

      if (Number(hp) !== hpValues.hp) {
        const actualHp = hpValues.hp;
        const hpSent = Number(hp) > hpValues.total ? hpValues.total : Number(hp);
        const gainedLife = hpSent > actualHp;
        const { body } = getActualBody(character);
        api.bodies
          .update({
            id: body?._id,
            hp: hpSent,
          })
          .then(() => {
            setCharacterFromId(character._id);
            dispatchCampaignEvent({
              result: (actualHp - hpSent) * -1,
              mode: gainedLife ? 'hpGain' : 'hpLoss',
            });
          })
          .catch(({ response }: ErrorResponseType) => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{response.data.message}</Ap>
                </Alert>
              ),
            });
          });
      }
    },
    [
      api,
      character,
      createAlert,
      dispatchCampaignEvent,
      getNewId,
      hpValues.hp,
      hpValues.total,
      setCharacterFromId,
      socket,
    ]
  );

  // To affect default data
  useEffect(() => {
    resetHp({ hp: hpValues.isLoading ? 0 : hpValues.hp });
  }, [hpValues, resetHp]);

  return (
    <div
      className={classTrim(`
      char-stats
      ${className ?? ''}
    `)}
    >
      <NumDisplayInput
        control={controlHp}
        inputName="hp"
        text={t('terms.character.hp.short')}
        rules={{ required: t('hp.required', { ns: 'fields' }) }}
        onBlur={(evt) => {
          void handleSubmitHp(onSaveHp)(evt);
        }}
        fixedValue={hpValues.total}
      />
      {charParamList}
      {statList}
    </div>
  );
};

export default CharacterStats;
