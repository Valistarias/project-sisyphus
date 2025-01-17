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

import './adminWeaponScopes.scss';

const AdminWeaponScopes: FC = () => {
  const { t } = useTranslation();
  const { weaponScopes } = useGlobalVars();

  // TODO: Handle i18n in place of basic english language
  const weaponScopesList = useMemo(() => {
    if (weaponScopes.length === 0) {
      return null;
    }

    return (
      <Aul className="adminWeaponScopes__weapon-scope-list" noPoints>
        {weaponScopes.map(({ weaponScope }) => (
          <Ali
            className={classTrim(`
              adminWeaponScopes__weapon-scope-list__elt
            `)}
            key={weaponScope._id}
          >
            <Atitle level={3}>{weaponScope.title}</Atitle>
            <Button href={`/admin/weaponscope/${weaponScope._id}`}>
              {t('adminWeaponScopes.editWeaponScope', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [weaponScopes, t]);

  return (
    <div className="adminWeaponScopes">
      <Atitle level={1}>{t('adminWeaponScopes.title', { ns: 'pages' })}</Atitle>
      <div className="adminWeaponScopes__content">
        <div className="adminWeaponScopes__weapon-scopes">
          <Atitle level={2}>{t('adminWeaponScopes.list', { ns: 'pages' })}</Atitle>
          <div className="adminWeaponScopes__weapon-scopes__list">{weaponScopesList}</div>
          <Button href="/admin/weaponscope/new">
            {t('adminNewWeaponScope.title', { ns: 'pages' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminWeaponScopes;
