import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ap, Atitle } from '../../atoms';
import { NumDisplay } from '../../molecules';
import {
  calculateStatModToString,
  curateProgram,
  type ICompleteDamage,
  type ICuratedSkillWithScore,
} from '../../utils/character';

import type { IBodyProgram } from '../../types';

import { classTrim } from '../../utils';

import './programAction.scss';
import { RichTextElement } from '../richTextElement';

interface IProgramAction {
  /** The action to display */
  program: IBodyProgram;
}

const ProgramAction: FC<IProgramAction> = ({ program }) => {
  const { t } = useTranslation();
  const { programScopes, rarities, damageTypes, characterStatSkills } = useGlobalVars();

  const curatedProgram = useMemo(
    () =>
      curateProgram({
        program: program.program,
        programScopes,
        rarities,
        damageTypes,
      }),
    [damageTypes, programScopes, program.program, rarities]
  );

  const correlatedCharacterSkill = useMemo<ICuratedSkillWithScore | undefined>(() => {
    if (characterStatSkills === undefined) {
      return undefined;
    }

    return characterStatSkills.skills.find(
      (charStatSkill) => charStatSkill.skill.formulaId === 'ars'
    );
  }, [characterStatSkills]);

  return (
    <div
      className={classTrim(`
      program-action
    `)}
    >
      <div className="program-action__main">
        <div className="program-action__main__designation">
          <Atitle className="program-action__main__designation__title" level={3}>
            {program.program.program.title}
          </Atitle>
          <Ap className="program-action__main__designation__sub">{`${t('itemTypeNames.pro', { count: 1 })} - ${curatedProgram.program.programScope?.programScope.title}`}</Ap>
        </div>
        {curatedProgram.program.summary !== null ? (
          <RichTextElement
            className="program-action__main__desc"
            rawStringContent={curatedProgram.program.summary}
            readOnly
          />
        ) : null}
        {curatedProgram.program.damages !== undefined ? (
          <div className="program-action__main__damages">
            {(curatedProgram.program.damages[0] as ICompleteDamage | undefined) !== undefined ? (
              <>
                {curatedProgram.program.damages[0].baseDamage > 0 ? (
                  <>
                    <Ap className="program-action__main__damages__base">
                      {curatedProgram.program.damages[0].baseDamage}
                    </Ap>
                    <Ap className="program-action__main__damages__plus">+</Ap>
                  </>
                ) : null}

                <NumDisplay size="small" value={curatedProgram.program.damages[0].dices} />
                <Ap className="program-action__main__damages__element">{`(${curatedProgram.program.damages[0].damageType?.damageType.title})`}</Ap>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="program-action__challenge">
        <Ap className="program-action__challenge__text">
          {t(
            curatedProgram.program.programScope?.programScope.scopeId === 'htg'
              ? 'display.cat.toHeal'
              : 'display.cat.toHit',
            { ns: 'components' }
          )}
        </Ap>
        {correlatedCharacterSkill !== undefined ? (
          <NumDisplay
            size="small"
            value={calculateStatModToString(correlatedCharacterSkill.score.total)}
            bonuses={correlatedCharacterSkill.score.sources}
          />
        ) : null}
        <Ap className="program-action__challenge__text">
          {t('display.cat.challenge', { ns: 'components' })}
        </Ap>
        <Ap className="program-action__challenge__to-hit-value">
          {curatedProgram.program.challenge}
        </Ap>
      </div>
    </div>
  );
};

export default ProgramAction;
