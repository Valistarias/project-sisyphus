import React, { useCallback, useMemo, type FC } from 'react';

import { useGlobalVars } from '../../providers';

import { NumDisplay } from '../../molecules';

import type { TypeCampaignEvent } from '../../types';

import { addSymbol, classTrim, type DiceRequest } from '../../utils';

import './characterStatus.scss';

interface ICharacterStatus {
  /** The classname of the element */
  className?: string
  /** The function sent to roll the dices */
  onRollDices: (diceValues: DiceRequest[], id: TypeCampaignEvent) => void
}

const CharacterStatus: FC<ICharacterStatus> = ({ className, onRollDices }) => {
  const { characterParams } = useGlobalVars();

  const onClickInit = useCallback(
    (offset: number) => {
      onRollDices(
        [
          {
            qty: 2,
            type: 8,
            offset
          }
        ],
        'init'
      );
    },
    [onRollDices]
  );

  const charParamList = useMemo(() => (
    <div className="char-status__char-params">
      {characterParams?.map((charParam) => {
        // TODO: Deal with i18n here
        const { title, summary, short } = charParam.charParam;

        return (
          <NumDisplay
            key={charParam.charParam._id}
            stat={charParam.stat}
            text={{ title, summary, short }}
            value={
              charParam.charParam.formulaId === 'ini'
                ? addSymbol(charParam.score.total)
                : String(charParam.score.total)
            }
            bonuses={charParam.score.sources}
            onClick={
              charParam.charParam.formulaId === 'ini'
                ? () => {
                    onClickInit(charParam.score.total);
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  ), [characterParams, onClickInit]);

  return (
    <div
      className={classTrim(`
      char-status
      ${className ?? ''}
    `)}
    >
      {charParamList}
    </div>
  );
};

export default CharacterStatus;
