import React, {
  useMemo, useRef, useState, type FC
} from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../providers';

import {
  Ali, Ap, Atitle, Aul
} from '../atoms';
import { PropDisplay } from '../molecules';
import {
  Quark, type IQuarkProps
} from '../quark';

import type {
  ICuratedItemModifier,
  ICuratedRarity,
  ICuratedWeapon,
  ICuratedWeaponScope,
  ICuratedWeaponType
} from '../types';
import type {
  ICuratedDamageType, IDamage, IWeapon
} from '../types/items';

import { classTrim } from '../utils';

import './weaponDisplay.scss';

interface IWeaponDisplay {
  /** The weapon to be displayed */
  weapon: ICuratedWeapon
  /** The display mode */
  mode?: 'basic' | 'hover'
}

interface ICompleteDamage extends Omit<IDamage, 'damageType'> {
  damageType: ICuratedDamageType | undefined
}

interface ICompleteWeapon
  extends Omit<IWeapon, 'weaponType' | 'weaponScope' | 'itemModifiers' | 'rarity' | 'damages'> {
  weaponType: ICuratedWeaponType | undefined
  weaponScope: ICuratedWeaponScope | undefined
  itemModifiers: ICuratedItemModifier[] | undefined
  rarity: ICuratedRarity | undefined
  damages: ICompleteDamage[]
}

interface ICuratedCompleteWeapon extends Omit<ICuratedWeapon, 'weapon'> {
  weapon: ICompleteWeapon
}

const WeaponDisplay: FC<IQuarkProps<IWeaponDisplay>> = ({
  weapon, mode = 'basic'
}) => {
  const { t } = useTranslation();
  const {
    weaponTypes, weaponScopes, itemModifiers, rarities, damageTypes
  } = useGlobalVars();

  const [placement, setPlacement] = useState<string>('left');
  const domBlockContent = useRef<HTMLDivElement>(null);

  const curatedWeapon = useMemo<ICuratedCompleteWeapon | null>(() => {
    if (
      weaponTypes.length === 0
      || weaponScopes.length === 0
    ) {
      return null;
    }
    const {
      weapon: weaponObj, i18n
    } = weapon;

    return {
      weapon: {
        ...weaponObj,
        weaponScope: weaponScopes.find(
          weaponScope => weaponScope.weaponScope._id === weaponObj.weaponScope
        ),
        weaponType: weaponTypes.find(
          weaponType => weaponType.weaponType._id === weaponObj.weaponType
        ),
        rarity: rarities.find(rarity => rarity.rarity._id === weaponObj.rarity),
        // itemModifiers[0] should never occurs. wath out for this
        itemModifiers: weaponObj.itemModifiers?.map(
          itemModifierId =>
            itemModifiers.find(
              itemModifier => itemModifier.itemModifier._id === itemModifierId
            ) ?? itemModifiers[0]
        ),
        damages: weaponObj.damages.map(weaponDamage => ({
          ...weaponDamage,
          damageType: damageTypes.find(
            damageType => damageType.damageType._id === weaponDamage.damageType
          )
        }))
      },
      i18n
    };
  }, [
    weaponTypes,
    weaponScopes,
    weapon,
    rarities,
    itemModifiers,
    damageTypes
  ]);

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
        mainNode={(
          <div className="weapon-display__block__main">
            <Atitle className="weapon-display__block__main__title" level={4}>
              {t('display.cat.damages', { ns: 'components' })}
            </Atitle>
            <Aul noPoints className="weapon-display__block__damages">
              {weapon.damages.map(damage => (
                <Ali key={damage._id} className="weapon-display__block__damages__elt">
                  {damage.dices}
                  <span className="weapon-display__block__damages__elt__type">{`(${damage.damageType?.damageType.title})`}</span>
                </Ali>
              ))}
            </Aul>
          </div>
        )}
        subNode={
          weapon.magasine !== undefined
            ? (
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
              )
            : undefined
        }
      />
    );
  }, [curatedWeapon, t]);

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
