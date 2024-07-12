import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ap, Atitle } from '../../atoms';
import { HintButton } from '../../molecules';
import { getCharacterHpValues } from '../../utils/character';

import {
  classTrim,
  getCyberFrameLevelsByNodes,
  romanize,
  type ICyberFrameLevels,
} from '../../utils';

import './characterHeader.scss';

interface ICharacterHeader {}

const CharacterHeader: FC<ICharacterHeader> = () => {
  const { t } = useTranslation();
  const { character, cyberFrames } = useGlobalVars();

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

  const hpValues = useMemo(() => getCharacterHpValues(character), [character]);

  const loading = useMemo(() => {
    if (character === null || character === false) {
      return true;
    }
    return false;
  }, [character]);

  return (
    <div
      className={classTrim(`
        char-header
      `)}
    >
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
          theme="solid"
          href={`/character/${character !== false ? character?._id ?? '' : ''}/edit`}
        />
      </div>
      <div className="char-header__right">
        <div className="char-header__health"></div>
      </div>
    </div>
  );
};

export default CharacterHeader;
