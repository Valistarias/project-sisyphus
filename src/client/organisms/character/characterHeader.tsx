import type React from 'react';
import { useCallback, useEffect, useMemo, type FC } from 'react';

import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  useApi,
  useCampaignEventWindow,
  useGlobalVars,
  useSocket,
  useSystemAlerts
} from '../../providers';

import { Aicon, Aloadbar, Ap, Atitle } from '../../atoms';
import { Button, HintButton, Input } from '../../molecules';
import { getActualBody, getCharacterHpValues } from '../../utils/character';
import Alert from '../alert';

import {
  classTrim,
  getCyberFrameLevelsByNodes,
  romanize,
  type ICyberFrameLevels
} from '../../utils';

import './characterHeader.scss';

interface FormHpValues {
  hp: string
}

interface FormKarmaValues {
  karma: string
}

interface ICharacterHeader {
  /** When the "Dices and Timeline" is clicked */
  onClickEventTab: (e: React.MouseEvent<HTMLElement>) => void
  /** Is the event tab open ? */
  isEventTabOpen: boolean
}

const CharacterHeader: FC<ICharacterHeader> = ({ onClickEventTab, isEventTabOpen }) => {
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
          chosenCyberFrame === null
          || (chosenCyberFrame !== null && actualCyberFrame.level > chosenCyberFrame.level)
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
        Number(globalValues.find(({ name }) => name === 'baseHp')?.value ?? 0),
        charParams.find(({ charParam }) => charParam.short === 'HP')?.charParam._id ?? undefined
      ),
    [character, globalValues, charParams]
  );

  const charKarma = useMemo(() => {
    if (character === null || character === false) {
      return 0;
    }

    return character.karma ?? 0;
  }, [character]);

  const {
    handleSubmit: handleSubmitHp,
    control: controlHp,
    reset: resetHp
  } = useForm({
    defaultValues: useMemo(() => ({ hp: hpValues.isLoading ? 0 : hpValues.hp }), [hpValues])
  });

  const {
    handleSubmit: handleSubmitKarma,
    control: controlKarma,
    reset: resetKarma
  } = useForm({
    defaultValues: useMemo(() => ({ karma: charKarma }), [charKarma])
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
            hp: hpSent
          })
          .then(() => {
            setCharacterFromId(character._id);
            dispatchCampaignEvent({
              result: (actualHp - hpSent) * -1,
              mode: gainedLife ? 'hpGain' : 'hpLoss'
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
              )
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
      socket
    ]
  );

  const onSaveKarma: SubmitHandler<FormKarmaValues> = useCallback(
    ({ karma }) => {
      if (api === undefined || character === null || character === false || socket === null) {
        return;
      }
      api.characters
        .update({
          id: character._id,
          karma
        })
        .then(() => {
          setCharacterFromId(character._id);
        })
        .catch(({ response }) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{response}</Ap>
              </Alert>
            )
          });
        });
    },
    [api, character, createAlert, getNewId, setCharacterFromId, socket]
  );

  // To affect default data
  useEffect(() => {
    resetHp({ hp: hpValues.isLoading ? 0 : hpValues.hp });
  }, [hpValues, resetHp]);

  useEffect(() => {
    resetKarma({ karma: charKarma });
  }, [charKarma, resetKarma]);

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
          {mainCyberFrame !== null
            ? (
                <Ap className="char-header__left__sub">
                  {t('character.cyberframeLevel', {
                    ns: 'pages',
                    cyberFrame: mainCyberFrame.cyberFrame.cyberFrame.title,
                    cyberFrameLevel: romanize(mainCyberFrame.level),
                    level: character !== false ? character?.level ?? 1 : 1
                  })}
                </Ap>
              )
            : null}
        </div>
        <div className="char-header__mid">
          <HintButton
            hint={t('character.buttons.editChar', {
              ns: 'pages'
            })}
            icon="Edit"
            size="small"
            theme="line"
            href={`/character/${character !== false ? character?._id ?? '' : ''}/edit`}
          />
          <HintButton
            hint={t('character.buttons.editChar', {
              ns: 'pages'
            })}
            icon="Edit"
            size="small"
            theme="line"
            href={`/character/${character !== false ? character?._id ?? '' : ''}/edit`}
          />
          <HintButton
            hint={t('character.buttons.editChar', {
              ns: 'pages'
            })}
            icon="Edit"
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
                    required: t('hp.required', { ns: 'fields' })
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
          <div className="char-header__karma">
            <form
              className="char-header__karma__field"
              onSubmit={handleSubmitKarma(onSaveKarma)}
              noValidate
            >
              <Ap className="char-header__karma__field__term">
                {t('terms.character.karma.short')}
              </Ap>
              <div className="char-header__karma__field__value">
                <Input
                  control={controlKarma}
                  inputName="karma"
                  type="number"
                  size="small"
                  inline
                  rules={{
                    required: t('karma.required', { ns: 'fields' })
                  }}
                  className="char-header__karma__field__input"
                  onBlur={handleSubmitKarma(onSaveKarma)}
                />
                <Ap className="char-header__karma__field__total">/ ??</Ap>
              </div>
            </form>

            <Aloadbar color="tertiary" progress={charKarma === 0 ? 0 : 0.5} />
          </div>
        </div>
        <div className="char-header__event-tab">
          <Button size="small" className="char-header__event-tab__btn" onClick={onClickEventTab}>
            <Aicon size="large" type="D8" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CharacterHeader;
