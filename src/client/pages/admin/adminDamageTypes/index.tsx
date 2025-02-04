import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../../providers';

import { Ali, Atitle, Aul } from '../../../atoms';
import { LinkButton } from '../../../molecules';

import { classTrim } from '../../../utils';

import './adminDamageTypes.scss';

const AdminDamageTypes: FC = () => {
  const { t } = useTranslation();
  const { damageTypes } = useGlobalVars();

  // TODO: Handle i18n in place of basic english language
  const damageTypesList = useMemo(() => {
    if (damageTypes.length === 0) {
      return null;
    }

    return (
      <Aul className="adminDamageTypes__damage-type-list" noPoints>
        {damageTypes.map(({ damageType }) => (
          <Ali
            className={classTrim(`
              adminDamageTypes__damage-type-list__elt
            `)}
            key={damageType._id}
          >
            <Atitle level={3}>{damageType.title}</Atitle>
            <LinkButton href={`/admin/damagetype/${damageType._id}`}>
              {t('adminDamageTypes.editDamageType', { ns: 'pages' })}
            </LinkButton>
          </Ali>
        ))}
      </Aul>
    );
  }, [damageTypes, t]);

  return (
    <div className="adminDamageTypes">
      <Atitle level={1}>{t('adminDamageTypes.title', { ns: 'pages' })}</Atitle>
      <div className="adminDamageTypes__content">
        <div className="adminDamageTypes__damage-types">
          <Atitle level={2}>{t('adminDamageTypes.list', { ns: 'pages' })}</Atitle>
          <div className="adminDamageTypes__damage-types__list">{damageTypesList}</div>
          <LinkButton href="/admin/damagetype/new">
            {t('adminNewDamageType.title', { ns: 'pages' })}
          </LinkButton>
        </div>
      </div>
    </div>
  );
};

export default AdminDamageTypes;
