import React, { useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../providers';

import { Ali, Ap, Atitle, Aul } from '../atoms';
import { PropDisplay } from '../molecules';
import { Quark, type IQuarkProps } from '../quark';
import { curateWeapon } from '../utils/character';

import type { ICuratedWeapon } from '../types';

import { classTrim } from '../utils';

import './weaponDisplay.scss';

interface IWeaponDisplay {
  /** The weapon to be displayed */
  weapon: ICuratedWeapon;
  /** The display mode */
  mode?: 'basic' | 'hover';
}

const WeaponDisplay: FC<IQuarkProps<IWeaponDisplay>> = ({ weapon, mode = 'basic' }) => {
  const { t } = useTranslation();
  const { weaponTypes, weaponStyles, weaponScopes, itemModifiers, rarities, damageTypes } =
    useGlobalVars();

  const [placement, setPlacement] = useState<string>('left');
  const domBlockContent = useRef<HTMLDivElement>(null);

  const curatedWeapon = useMemo(
    () => curateWeapon({ weaponTypes, weaponScopes, weapon, rarities, itemModifiers, damageTypes }),
    [weaponTypes, weaponScopes, weapon, rarities, itemModifiers, damageTypes]
  );

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

  const weaponBlock = useMemo(() => {
    if (curatedWeapon === null) {
      return null;
    }

    const type = curatedWeapon.weapon.weaponType;
    const scope = curatedWeapon.weapon.weaponScope;
    // TODO: Internationalization
    const { weapon } = curatedWeapon;
    const { rarity } = weapon;

    const linkedWeaponStyle = weaponStyles.find(
      (weaponStyle) => weaponStyle.weaponStyle._id === type?.weaponType.weaponStyle._id
    );

    return (
      <PropDisplay
        ref={domBlockContent}
        className="weapon-display__block"
        rarity={rarity?.rarity.title ?? ''}
        rarityLevel={rarity?.rarity.position ?? 0}
        icon={type?.weaponType.icon}
        title={weapon.title}
        subTitle={scope?.weaponScope.title}
        type={type?.weaponType.title ?? ''}
        itemModifiers={weapon.itemModifiers}
        mainNode={
          <div className="weapon-display__block__main">
            <Atitle className="weapon-display__block__main__title" level={3}>
              {t('display.cat.damages', { ns: 'components' })}
            </Atitle>
            <div className="weapon-display__block__main__titles">
              <Atitle className="weapon-display__block__main__base-dmg" level={4}>
                {t('display.cat.baseDamages', { ns: 'components' })}
              </Atitle>
              <Atitle className="weapon-display__block__main__main-dmg" level={4}>
                {t('display.cat.challengeDamages', { ns: 'components' })}
              </Atitle>
            </div>

            <Aul noPoints className="weapon-display__block__main__damages">
              {weapon.damages.map((damage) => (
                <Ali key={damage._id} className="weapon-display__block__main__damages__elt">
                  <div className="weapon-display__block__main__base-dmg">{damage.baseDamage}</div>
                  <div className="weapon-display__block__main__main-dmg">
                    {damage.dices}
                    <span className="weapon-display__block__main__damages__elt__type">{`(${damage.damageType?.damageType.title})`}</span>
                  </div>
                </Ali>
              ))}
            </Aul>

            <Atitle className="weapon-display__block__main__title" level={3}>
              {t('display.cat.challenge', { ns: 'components' })}
            </Atitle>
            <Ap className="weapon-display__block__main__challenge">
              {weapon.challenge}
              <span className="weapon-display__block__main__challenge__type">{`(${linkedWeaponStyle?.weaponStyle.skill.title})`}</span>
            </Ap>
          </div>
        }
        subNode={
          weapon.magasine !== undefined ? (
            <div className="weapon-display__block__sub">
              <div className="weapon-display__block__number-block">
                <Atitle className="weapon-display__block__number-block__title" level={4}>
                  {t('display.cat.clip', { ns: 'components' })}
                </Atitle>
                <Ap className="weapon-display__block__number-block__number">
                  {`${weapon.magasine} / ${weapon.ammoPerShot ?? 0}`}
                </Ap>
              </div>
            </div>
          ) : undefined
        }
      />
    );
  }, [curatedWeapon, t, weaponStyles]);

  if (mode === 'hover') {
    return (
      <Quark
        quarkType="div"
        onMouseEnter={handleMouseEnter}
        className={classTrim(`
        weapon-display
        weapon-display--mode-${mode}
        weapon-display--${placement}
      `)}
      >
        <Ap className="weapon-display__text-hover">{curatedWeapon?.weapon.title}</Ap>
        {weaponBlock}
      </Quark>
    );
  }

  return (
    <Quark
      quarkType="span"
      className={classTrim(`
        weapon-display
        weapon-display--mode-${mode}
      `)}
    >
      {weaponBlock}
    </Quark>
  );
};

export default WeaponDisplay;
