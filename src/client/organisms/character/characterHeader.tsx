import React from 'react';
import { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Aicon, Ap } from '../../atoms';
import { HintButton, HintButtonLink } from '../../molecules';

import {
  classTrim,
  decimal,
  getCyberFrameLevelsByNodes,
  romanize,
  type ICyberFrameLevels,
} from '../../utils';

import './characterHeader.scss';

// interface FormKarmaValues {
//   karma: number;
// }

interface ICharacterHeader {
  /** When the "Dices and Timeline" is clicked */
  onOpenTab: (e: React.MouseEvent<HTMLElement>) => void;
}

const CharacterHeader: FC<ICharacterHeader> = ({ onOpenTab }) => {
  const { t } = useTranslation();
  const { character, cyberFrames } = useGlobalVars();

  const mainCyberFrame = useMemo(() => {
    if (character === null || character === false) {
      return null;
    }
    const cyberFrameLevelsByNodes = getCyberFrameLevelsByNodes(character.nodes, cyberFrames);

    return cyberFrameLevelsByNodes.reduce(
      (chosenCyberFrame: ICyberFrameLevels | null, actualCyberFrame: ICyberFrameLevels) => {
        if (chosenCyberFrame === null || actualCyberFrame.level > chosenCyberFrame.level) {
          return actualCyberFrame;
        }

        return chosenCyberFrame;
      },
      null
    );
  }, [character, cyberFrames]);

  const displayedName = useMemo(() => {
    if (character === null || character === false) {
      return {
        text: '',
        maxLength: 0,
      };
    }

    let text: string;
    let maxLength = 0;

    if (character.nickName !== undefined) {
      text = character.nickName;
    } else {
      text = `${character.firstName ?? ''} ${character.lastName ?? ''}`;
    }

    text.split(' ').forEach((text) => {
      if (maxLength < text.length) {
        maxLength = text.length;
      }
    });

    if (maxLength < 5) {
      maxLength = 5;
    }

    return {
      text,
      maxLength,
    };
  }, [character]);

  // const charKarma = useMemo(() => {
  //   if (character === null || character === false) {
  //     return 0;
  //   }

  //   return character.karma ?? 0;
  // }, [character]);

  // const {
  //   handleSubmit: handleSubmitKarma,
  //   control: controlKarma,
  //   reset: resetKarma,
  // } = useForm({ defaultValues: useMemo(() => ({ karma: charKarma }), [charKarma]) });

  // const onSaveKarma: SubmitHandler<FormKarmaValues> = useCallback(
  //   ({ karma }) => {
  //     if (api === undefined || character === null || character === false || socket === null) {
  //       return;
  //     }
  //     api.characters
  //       .update({
  //         id: character._id,
  //         karma,
  //       })
  //       .then(() => {
  //         setCharacterFromId(character._id);
  //       })
  //       .catch(({ response }: ErrorResponseType) => {
  //         const newId = getNewId();
  //         createAlert({
  //           key: newId,
  //           dom: (
  //             <Alert key={newId} id={newId} timer={5}>
  //               <Ap>{response.data.message}</Ap>
  //             </Alert>
  //           ),
  //         });
  //       });
  //   },
  //   [api, character, createAlert, getNewId, setCharacterFromId, socket]
  // );

  // To affect default data
  // useEffect(() => {
  //   resetHp({ hp: hpValues.isLoading ? 0 : hpValues.hp });
  // }, [hpValues, resetHp]);

  // useEffect(() => {
  //   resetKarma({ karma: charKarma });
  // }, [charKarma, resetKarma]);

  return (
    <div
      className={classTrim(`
        char-header
      `)}
    >
      {/* <div className="char-header__content">
        <div className="char-header__right">
          <div className="char-header__karma">
            <form
              className="char-header__karma__field"
              onSubmit={(evt) => {
                void handleSubmitKarma(onSaveKarma)(evt);
              }}
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
                  rules={{ required: t('karma.required', { ns: 'fields' }) }}
                  className="char-header__karma__field__input"
                  onBlur={(evt) => {
                    void handleSubmitKarma(onSaveKarma)(evt);
                  }}
                />
                <Ap className="char-header__karma__field__total">/ ??</Ap>
              </div>
            </form>

            <Aloadbar color="tertiary" progress={charKarma === 0 ? 0 : 0.5} />
          </div>
        </div>
      </div> */}
      <div className="char-header">
        <Aicon className="char-header__logo" type="Eidolon" />
        {mainCyberFrame !== null ? (
          <Ap className="char-header__cyber-frame">
            <span className="char-header__cyber-frame__name">
              {mainCyberFrame.cyberFrame.cyberFrame.title}
            </span>
            <span className="char-header__cyber-frame__level">
              {romanize(mainCyberFrame.level)}
            </span>
          </Ap>
        ) : null}
        <Ap
          className="char-header__name"
          style={{
            fontSize: `${decimal(32 / displayedName.maxLength, 10)
              .toString()
              .replace(/,/g, '.')}rem`,
          }}
        >
          {displayedName.text}
        </Ap>
        <div className="char-header__interactions">
          <HintButtonLink
            hint={t('character.buttons.editChar', { ns: 'pages' })}
            icon="Edit"
            size="small"
            theme="line"
            href={`/character/${character !== false ? (character?._id ?? '') : ''}/edit`}
          />
          <HintButton
            hint={t('character.buttons.openRollTab', { ns: 'pages' })}
            onClick={onOpenTab}
            icon="D10Bold"
            size="small"
            theme="line"
          />
          <HintButtonLink
            hint={t('character.buttons.editChar', { ns: 'pages' })}
            icon="Edit"
            size="small"
            theme="line"
            href={`/character/${character !== false ? (character?._id ?? '') : ''}/edit`}
          />
          <HintButtonLink
            hint={t('character.buttons.editChar', { ns: 'pages' })}
            icon="Edit"
            size="small"
            theme="line"
            href={`/character/${character !== false ? (character?._id ?? '') : ''}/edit`}
          />
          <HintButtonLink
            hint={t('character.buttons.editChar', { ns: 'pages' })}
            icon="Edit"
            size="small"
            theme="line"
            href={`/character/${character !== false ? (character?._id ?? '') : ''}/edit`}
          />
          <HintButtonLink
            hint={t('character.buttons.editChar', { ns: 'pages' })}
            icon="Edit"
            size="small"
            theme="line"
            href={`/character/${character !== false ? (character?._id ?? '') : ''}/edit`}
          />
        </div>
      </div>
    </div>
  );
};

export default CharacterHeader;
