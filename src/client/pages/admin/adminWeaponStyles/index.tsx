import React, {
  useMemo, type FC
} from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../../providers';

import {
  Ali, Atitle, Aul
} from '../../../atoms';
import { Button } from '../../../molecules';

import { classTrim } from '../../../utils';

import './adminWeaponStyles.scss';

const AdminWeaponStyles: FC = () => {
  const { t } = useTranslation();
  const { weaponStyles } = useGlobalVars();

  // TODO: Handle i18n in place of basic english language
  const weaponStylesList = useMemo(() => {
    if (weaponStyles.length === 0) {
      return null;
    }

    return (
      <Aul className="adminWeaponStyles__weapon-style-list" noPoints>
        {weaponStyles.map(({ weaponStyle }) => (
          <Ali
            className={classTrim(`
              adminWeaponStyles__weapon-style-list__elt
            `)}
            key={weaponStyle._id}
          >
            <Atitle level={3}>{weaponStyle.title}</Atitle>
            <Button href={`/admin/weaponstyle/${weaponStyle._id}`}>
              {t('adminWeaponStyles.editWeaponStyle', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [weaponStyles, t]);

  return (
    <div className="adminWeaponStyles">
      <Atitle level={1}>{t('adminWeaponStyles.title', { ns: 'pages' })}</Atitle>
      <div className="adminWeaponStyles__content">
        <div className="adminWeaponStyles__weapon-styles">
          <Atitle level={2}>{t('adminWeaponStyles.list', { ns: 'pages' })}</Atitle>
          <div className="adminWeaponStyles__weapon-styles__list">{weaponStylesList}</div>
          <Button href="/admin/weaponstyle/new">
            {t('adminNewWeaponStyle.title', { ns: 'pages' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminWeaponStyles;
