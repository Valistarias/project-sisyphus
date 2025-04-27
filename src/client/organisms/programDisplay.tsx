import React, { useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../providers';

import { Ali, Ap, Atitle, Aul } from '../atoms';
import { PropDisplay } from '../molecules';
import { Quark, type IQuarkProps } from '../quark';

import { RichTextElement } from './richTextElement';

import type { ICuratedProgram, ICuratedProgramScope, ICuratedRarity } from '../types';
import type { ICuratedDamageType, IDamage, IProgram } from '../types/items';

import { classTrim } from '../utils';

import './programDisplay.scss';

interface IProgramDisplay {
  /** The program to be displayed */
  program: ICuratedProgram;
  /** The display mode */
  mode?: 'basic' | 'hover';
}

interface ICompleteDamage extends Omit<IDamage, 'damageType'> {
  damageType: ICuratedDamageType | undefined;
}

interface ICompleteProgram extends Omit<IProgram, 'programScope' | 'rarity' | 'damages'> {
  programScope: ICuratedProgramScope | undefined;
  rarity: ICuratedRarity | undefined;
  damages: ICompleteDamage[];
}

interface ICuratedCompleteProgram extends Omit<ICuratedProgram, 'program'> {
  program: ICompleteProgram;
}

const ProgramDisplay: FC<IQuarkProps<IProgramDisplay>> = ({ program, mode = 'basic' }) => {
  const { t } = useTranslation();
  const { programScopes, rarities, damageTypes } = useGlobalVars();

  const [placement, setPlacement] = useState<string>('left');
  const domBlockContent = useRef<HTMLDivElement>(null);

  const curatedProgram = useMemo<ICuratedCompleteProgram | null>(() => {
    if (programScopes.length === 0) {
      return null;
    }
    const { program: programObj, i18n } = program;

    return {
      program: {
        ...programObj,
        programScope: programScopes.find(
          (programScope) => programScope.programScope._id === programObj.programScope
        ),
        rarity: rarities.find((rarity) => rarity.rarity._id === programObj.rarity),
        damages:
          programObj.damages?.map((programDamage) => ({
            ...programDamage,
            damageType: damageTypes.find(
              (damageType) => damageType.damageType._id === programDamage.damageType
            ),
          })) ?? [],
      },
      i18n,
    };
  }, [programScopes, program, rarities, damageTypes]);

  const handleMouseEnter = (): void => {
    if (mode === 'hover') {
      if (domBlockContent.current !== null) {
        const dimensions = domBlockContent.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        let leftRight = placement;
        if (leftRight === 'left' && dimensions.right > windowWidth && dimensions.left > 60) {
          leftRight = 'right';
        } else if (leftRight === 'right' && dimensions.left < 0) {
          leftRight = 'left';
        }
        setPlacement(leftRight);
      }
    }
  };

  const programBlock = useMemo(() => {
    if (curatedProgram === null) {
      return null;
    }

    const scope = curatedProgram.program.programScope;
    // TODO: Internationalization
    const { program } = curatedProgram;
    const { rarity } = program;

    return (
      <PropDisplay
        ref={domBlockContent}
        className="program-display__block"
        rarity={rarity?.rarity.title ?? ''}
        rarityLevel={rarity?.rarity.position ?? 0}
        icon="brain"
        title={program.title}
        subTitle={`${scope?.programScope.title}${program.radius !== undefined ? ` (${program.radius}m)` : ''}`}
        type={t('itemTypeNames.pro')}
        mainNode={
          <div className="program-display__block__main">
            {program.summary !== null ? (
              <RichTextElement
                className="program-display__block__main__desc"
                rawStringContent={program.summary}
                readOnly
              />
            ) : null}
            {program.damages.length !== 0 ? (
              <>
                <Atitle className="program-display__block__main__title" level={3}>
                  {t(
                    scope?.programScope.scopeId !== 'htg'
                      ? 'display.cat.damages'
                      : 'display.cat.heals',
                    { ns: 'components' }
                  )}
                </Atitle>
                <div className="program-display__block__main__titles">
                  {program.damages[0]?.baseDamage !== 0 ? (
                    <>
                      <Atitle className="program-display__block__main__base-dmg" level={4}>
                        {t('display.cat.baseDamages', { ns: 'components' })}
                      </Atitle>
                      <Atitle className="program-display__block__main__main-dmg" level={4}>
                        {t('display.cat.challengeDamages', { ns: 'components' })}
                      </Atitle>
                    </>
                  ) : null}
                </div>

                <Aul noPoints className="program-display__block__main__damages">
                  {program.damages.map((damage) => (
                    <Ali key={damage._id} className="program-display__block__main__damages__elt">
                      {damage.baseDamage !== 0 ? (
                        <div className="program-display__block__main__base-dmg">
                          {damage.baseDamage}
                        </div>
                      ) : null}
                      <div className="program-display__block__main__main-dmg">
                        {damage.dices}
                        <span className="program-display__block__main__damages__elt__type">{`(${damage.damageType?.damageType.title})`}</span>
                      </div>
                    </Ali>
                  ))}
                </Aul>
              </>
            ) : null}

            <Atitle className="program-display__block__main__title" level={3}>
              {t('display.cat.challenge', { ns: 'components' })}
            </Atitle>
            <Ap className="program-display__block__main__challenge">{program.challenge}</Ap>
          </div>
        }
      />
    );
  }, [curatedProgram, t]);

  if (mode === 'hover') {
    return (
      <Quark
        quarkType="div"
        onMouseEnter={handleMouseEnter}
        className={classTrim(`
        program-display
        program-display--mode-${mode}
        program-display--${placement}
      `)}
      >
        <Ap className="program-display__text-hover">{curatedProgram?.program.title}</Ap>
        {programBlock}
      </Quark>
    );
  }

  return (
    <Quark
      quarkType="span"
      className={classTrim(`
        program-display
        program-display--mode-${mode}
      `)}
    >
      {programBlock}
    </Quark>
  );
};

export default ProgramDisplay;
