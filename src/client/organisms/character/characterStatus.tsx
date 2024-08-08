import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { NumDisplay } from '../../molecules';

import { addSymbol, classTrim } from '../../utils';

import './characterStatus.scss';

interface ICharacterStatus {
  /** The classname of the element */
  className?: string;
}

const CharacterStatus: FC<ICharacterStatus> = ({ className }) => {
  const { t } = useTranslation();
  const { characterParams } = useGlobalVars();

  console.log('characterParams', characterParams);

  const charParamList = useMemo(() => {
    return (
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
              // onClick={() => {
              //   onRollDices(
              //     [
              //       {
              //         qty: 2,
              //         type: 8,
              //         offset: calculateStatMod(charParam.score.total),
              //       },
              //     ],
              //     `charParam-${charParam.charParam._id}`
              //   );
              // }}
            />
          );
        })}
      </div>
    );
  }, [characterParams]);

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
