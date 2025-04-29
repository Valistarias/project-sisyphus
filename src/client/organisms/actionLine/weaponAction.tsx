import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ap, Atitle } from '../../atoms';
import { NumDisplay } from '../../molecules';
import {
  curateWeapon,
  type ICuratedSkillWithScore,
  type ICompleteDamage,
  calculateStatModToString,
} from '../../utils/character';

import type { IBodyWeapon } from '../../types';

import { classTrim } from '../../utils';
import './weaponAction.scss';

interface IWeaponAction {
  /** The action to display */
  weapon: IBodyWeapon;
}

const WeaponAction: FC<IWeaponAction> = ({ weapon }) => {
  const { t } = useTranslation();
  const { weaponTypes, weaponScopes, itemModifiers, rarities, damageTypes, characterStatSkills } =
    useGlobalVars();

  const curatedWeapon = useMemo(
    () =>
      curateWeapon({
        weaponTypes,
        weaponScopes,
        weapon: weapon.weapon,
        rarities,
        itemModifiers,
        damageTypes,
      }),
    [weaponTypes, weaponScopes, weapon, rarities, itemModifiers, damageTypes]
  );

  const correlatedCharacterSkill = useMemo<ICuratedSkillWithScore | undefined>(() => {
    if (characterStatSkills === undefined || curatedWeapon === null) {
      return undefined;
    }

    return characterStatSkills.skills.find(
      (charStatSkill) =>
        charStatSkill.skill._id === curatedWeapon.weapon.weaponType?.weaponType.weaponStyle.skill
    );
  }, [curatedWeapon, characterStatSkills]);

  if (curatedWeapon === null) {
    return null;
  }

  return (
    <div
      className={classTrim(`
      weapon-action
    `)}
    >
      <div className="weapon-action__main">
        <div className="weapon-action__main__designation">
          <Atitle className="weapon-action__main__designation__title" level={3}>
            {weapon.weapon.weapon.title}
          </Atitle>
          <Ap className="weapon-action__main__designation__sub">{`${curatedWeapon.weapon.weaponType?.weaponType.title} - ${curatedWeapon.weapon.weaponScope?.weaponScope.title}`}</Ap>
        </div>
        <div className="weapon-action__main__damages">
          {(curatedWeapon.weapon.damages[0] as ICompleteDamage | undefined) !== undefined ? (
            <>
              <Ap className="weapon-action__main__damages__base">
                {curatedWeapon.weapon.damages[0].baseDamage}
              </Ap>
              <Ap className="weapon-action__main__damages__plus">+</Ap>
              <NumDisplay size="small" value={curatedWeapon.weapon.damages[0].dices} />
              <Ap className="weapon-action__main__damages__element">{`(${curatedWeapon.weapon.damages[0].damageType?.damageType.title})`}</Ap>
            </>
          ) : null}
        </div>
      </div>
      <div className="weapon-action__challenge">
        <Ap className="weapon-action__challenge__text">
          {t('display.cat.toHit', { ns: 'components' })}
        </Ap>
        {correlatedCharacterSkill !== undefined ? (
          <NumDisplay
            size="small"
            value={calculateStatModToString(correlatedCharacterSkill.score.total)}
            bonuses={correlatedCharacterSkill.score.sources}
          />
        ) : null}
        <Ap className="weapon-action__challenge__text">
          {t('display.cat.challenge', { ns: 'components' })}
        </Ap>
        <Ap className="weapon-action__challenge__to-hit-value">{curatedWeapon.weapon.challenge}</Ap>
      </div>
    </div>
  );
};

export default WeaponAction;
