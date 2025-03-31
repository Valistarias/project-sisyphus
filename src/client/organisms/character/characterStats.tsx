import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { NumDisplay } from '../../molecules';
import { calculateStatMod, calculateStatModToString, malusStatMod } from '../../utils/character';

import type { TypeCampaignEvent } from '../../types';

import { addSymbol, classTrim, type DiceRequest } from '../../utils';

import './characterStats.scss';

interface ICharacterStats {
  /** The function sent to roll the dices */
  onRollDices: (diceValues: DiceRequest[], id: TypeCampaignEvent) => void;
  /** The classname of the element */
  className?: string;
}

const CharacterStats: FC<ICharacterStats> = ({ className, onRollDices }) => {
  const { t } = useTranslation();
  const { characterStatSkills, characterParams } = useGlobalVars();

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

  return (
    <div
      className={classTrim(`
      char-stats
      ${className ?? ''}
    `)}
    >
      {charParamList}
      {statList}
    </div>
  );
};

export default CharacterStats;
