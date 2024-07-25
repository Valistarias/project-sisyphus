import React, { useCallback, useEffect, useMemo, type FC } from 'react';

import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  useApi,
  useCampaignEventWindow,
  useGlobalVars,
  useSocket,
  useSystemAlerts,
} from '../../providers';

import { Aloadbar, Ap, Atitle } from '../../atoms';
import { HintButton, Input } from '../../molecules';
import { getActualBody, getCharacterHpValues } from '../../utils/character';
import Alert from '../alert';

import {
  classTrim,
  getCyberFrameLevelsByNodes,
  romanize,
  type ICyberFrameLevels,
} from '../../utils';

import './characterHeader.scss';

interface FormHpValues {
  hp: string;
}

const CharacterHeader: FC = () => {
  const { t } = useTranslation();
  const { createAlert, getNewId } = useSystemAlerts();
  const { api } = useApi();
  const { socket } = useSocket();
  const { dispatchCampaignEvent } = useCampaignEventWindow();
  const { character, setCharacterFromId, cyberFrames, globalValues, charParams } = useGlobalVars();

  const mainCyberFrame = useMemo(() => {
    if (character === null || character === false) {
      return null;
    }
    const cyberFrameLevelsByNodes = getCyberFrameLevelsByNodes(character.nodes, cyberFrames);
    return cyberFrameLevelsByNodes.reduce(
      (chosenCyberFrame: ICyberFrameLevels | null, actualCyberFrame: ICyberFrameLevels) => {
        if (
          chosenCyberFrame === null ||
          (chosenCyberFrame !== null && actualCyberFrame.level > chosenCyberFrame.level)
        ) {
          return actualCyberFrame;
        }
        return chosenCyberFrame;
      },
      null
    );
  }, [character, cyberFrames]);

  const displayedName = useMemo(() => {
    if (character === null || character === false) {
      return '';
    }
    return `${character.firstName !== undefined ? `${character.firstName} ` : ''}${character.nickName !== undefined ? `"${character.nickName}" ` : ''}${character.lastName ?? ''}`;
  }, [character]);

  const hpValues = useMemo(
    () =>
      getCharacterHpValues(
        character,
        Number(globalValues.find(({ name }) => name === 'startHp')?.value ?? 0),
        charParams.find(({ charParam }) => charParam.short === 'HP')?.charParam._id ?? undefined
      ),
    [character, globalValues, charParams]
  );

  const {
    handleSubmit: handleSubmitHp,
    control: controlHp,
    reset: resetHp,
  } = useForm<FieldValues>({
    defaultValues: useMemo(() => ({ hp: hpValues.isLoading ? 0 : hpValues.hp }), [hpValues]),
  });

  const onSaveHp: SubmitHandler<FormHpValues> = useCallback(
    ({ hp }) => {
      if (api === undefined || character === null || character === false || socket === null) {
        return;
      }
      if (hp !== undefined && Number(hp) !== hpValues.hp) {
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
          .catch(({ response }) => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{response}</Ap>
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
        char-header
      `)}
    >
      <div className="char-header__content">
        <div className="char-header__left">
          <Atitle level={1} className="char-header__left__title">
            {displayedName}
          </Atitle>
          {mainCyberFrame !== null ? (
            <Ap className="char-header__left__sub">
              {t('character.cyberframeLevel', {
                ns: 'pages',
                cyberFrame: mainCyberFrame.cyberFrame.cyberFrame.title,
                cyberFrameLevel: romanize(mainCyberFrame.level),
                level: character !== false ? character?.level ?? 1 : 1,
              })}
            </Ap>
          ) : null}
        </div>
        <div className="char-header__mid">
          <HintButton
            hint={t('character.buttons.editChar', {
              ns: 'pages',
            })}
            icon="edit"
            size="small"
            theme="line"
            href={`/character/${character !== false ? character?._id ?? '' : ''}/edit`}
          />
        </div>
        <div className="char-header__right">
          <div className="char-header__health">
            <form
              className="char-header__health__field"
              onSubmit={handleSubmitHp(onSaveHp)}
              noValidate
            >
              <Ap className="char-header__health__field__term">{t('terms.character.hp.short')}</Ap>
              <div className="char-header__health__field__value">
                <Input
                  control={controlHp}
                  inputName="hp"
                  type="number"
                  size="small"
                  inline
                  rules={{
                    required: t('hp.required', { ns: 'fields' }),
                  }}
                  className="char-header__health__field__input"
                  onBlur={handleSubmitHp(onSaveHp)}
                />
                <Ap className="char-header__health__field__total">{`/ ${hpValues.total}`}</Ap>
              </div>
            </form>

            <Aloadbar
              progress={
                hpValues.isLoading || hpValues.total === 0 ? 0 : hpValues.hp / hpValues.total
              }
              withDangerZone
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterHeader;
