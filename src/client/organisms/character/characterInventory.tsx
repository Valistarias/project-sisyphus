import React, { type ReactNode, useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ali, Atitle, Aul } from '../../atoms';
import { getActualBody } from '../../utils/character';
import ArmorDisplay from '../armorDisplay';
import ImplantDisplay from '../implantDisplay';
import ItemDisplay from '../itemDisplay';
import ProgramDisplay from '../programDisplay';
import WeaponDisplay from '../weaponDisplay';

import './characterInventory.scss';

import { classTrim } from '../../utils';

const CharacterInventory: FC = () => {
  const { t } = useTranslation();
  const { character } = useGlobalVars();

  const inventoryList = useMemo<
    Array<{
      id: string;
      elt: ReactNode;
    }>
  >(() => {
    if (character === null || character === false) {
      return [];
    }
    const { body } = getActualBody(character);

    if (body === undefined) {
      return [];
    }

    const inventoryList: Array<{
      id: string;
      elt: ReactNode;
    }> = [];

    body.items?.forEach((item) => {
      inventoryList.push({
        id: item._id,
        elt: <ItemDisplay item={item.item} mode="hover" />,
      });
    });

    // TODO: How to display ammo ?
    // TODO: How to display bags ?

    body.implants?.forEach((implant) => {
      inventoryList.push({
        id: implant._id,
        elt: <ImplantDisplay implant={implant.implant} mode="hover" />,
      });
    });

    body.programs?.forEach((program) => {
      inventoryList.push({
        id: program._id,
        elt: <ProgramDisplay program={program.program} mode="hover" />,
      });
    });

    body.weapons?.forEach((weapon) => {
      inventoryList.push({
        id: weapon._id,
        elt: <WeaponDisplay weapon={weapon.weapon} mode="hover" />,
      });
    });

    body.armors?.forEach((armor) => {
      inventoryList.push({
        id: armor._id,
        elt: <ArmorDisplay armor={armor.armor} mode="hover" />,
      });
    });

    return inventoryList;
  }, [character]);

  return (
    <div
      className={classTrim(`
      char-inventory
    `)}
    >
      <Atitle level={3} className="char-inventory__title">
        {t('characterInventory.main', { ns: 'components' })}
      </Atitle>
      <Aul noPoints className="char-inventory__list">
        {inventoryList.map(({ id, elt }) => (
          <Ali className="char-inventory__list__elt" key={id}>
            {elt}
          </Ali>
        ))}
      </Aul>
    </div>
  );
};

export default CharacterInventory;
