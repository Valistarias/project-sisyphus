import React, {
  useMemo, type FC
} from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../../providers';

import {
  Ali, Atitle, Aul
} from '../../../atoms';
import { LinkButton } from '../../../molecules';

import { classTrim } from '../../../utils';

import './adminWeaponTypes.scss';

const AdminWeaponTypes: FC = () => {
  const { t } = useTranslation();
  const { weaponTypes } = useGlobalVars();

  // TODO: Handle i18n in place of basic english language
  const weaponTypesList = useMemo(() => {
    if (weaponTypes.length === 0) {
      return null;
    }

    return (
      <Aul className="adminWeaponTypes__weapon-type-list" noPoints>
        {weaponTypes.map(({ weaponType }) => (
          <Ali
            className={classTrim(`
              adminWeaponTypes__weapon-type-list__elt
            `)}
            key={weaponType._id}
          >
            <Atitle level={3}>{weaponType.title}</Atitle>
            <LinkButton href={`/admin/weapontype/${weaponType._id}`}>
              {t('adminWeaponTypes.editWeaponType', { ns: 'pages' })}
            </LinkButton>
          </Ali>
        ))}
      </Aul>
    );
  }, [weaponTypes, t]);

  return (
    <div className="adminWeaponTypes">
      <Atitle level={1}>{t('adminWeaponTypes.title', { ns: 'pages' })}</Atitle>
      <div className="adminWeaponTypes__content">
        <div className="adminWeaponTypes__weapon-types">
          <Atitle level={2}>{t('adminWeaponTypes.list', { ns: 'pages' })}</Atitle>
          <div className="adminWeaponTypes__weapon-types__list">{weaponTypesList}</div>
          <LinkButton href="/admin/weapontype/new">
            {t('adminNewWeaponType.title', { ns: 'pages' })}
          </LinkButton>
        </div>
      </div>
    </div>
  );
};

export default AdminWeaponTypes;
