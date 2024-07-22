import React, { useCallback, useMemo, type FC } from 'react';

import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Aloadbar, Ap, Atitle } from '../../atoms';
import { HintButton, Input } from '../../molecules';
import { getCharacterHpValues } from '../../utils/character';

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

interface ICharacterHeader {}

const CharacterHeader: FC<ICharacterHeader> = () => {
  const { t } = useTranslation();
  const { character, cyberFrames, globalValues, charParams } = useGlobalVars();

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

  const loading = useMemo(() => {
    if (character === null || character === false) {
      return true;
    }
    return false;
  }, [character]);

  const { handleSubmit: handleSubmitHp, control: controlHp } = useForm<FieldValues>({
    defaultValues: useMemo(() => ({ hp: hpValues.isLoading ? 0 : hpValues.hp }), [hpValues]),
  });

  const onSaveHp: SubmitHandler<FormHpValues> = useCallback(({ hp }) => {
    if (hp !== undefined) {
      console.log('hp', hp);
    }
  }, []);

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
              progress={hpValues.isLoading || hpValues.hp === 0 ? 0 : hpValues.total / hpValues.hp}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterHeader;
