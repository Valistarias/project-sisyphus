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

import './adminArmorTypes.scss';

const AdminArmorTypes: FC = () => {
  const { t } = useTranslation();
  const { armorTypes } = useGlobalVars();

  // TODO: Handle i18n in place of basic english language
  const armorTypesList = useMemo(() => {
    if (armorTypes.length === 0) {
      return null;
    }

    return (
      <Aul className="adminArmorTypes__armor-type-list" noPoints>
        {armorTypes.map(({ armorType }) => (
          <Ali
            className={classTrim(`
              adminArmorTypes__armor-type-list__elt
            `)}
            key={armorType._id}
          >
            <Atitle level={3}>{armorType.title}</Atitle>
            <LinkButton href={`/admin/armortype/${armorType._id}`}>
              {t('adminArmorTypes.editArmorType', { ns: 'pages' })}
            </LinkButton>
          </Ali>
        ))}
      </Aul>
    );
  }, [armorTypes, t]);

  return (
    <div className="adminArmorTypes">
      <Atitle level={1}>{t('adminArmorTypes.title', { ns: 'pages' })}</Atitle>
      <div className="adminArmorTypes__content">
        <div className="adminArmorTypes__armor-types">
          <Atitle level={2}>{t('adminArmorTypes.list', { ns: 'pages' })}</Atitle>
          <div className="adminArmorTypes__armor-types__list">{armorTypesList}</div>
          <LinkButton href="/admin/armortype/new">
            {t('adminNewArmorType.title', { ns: 'pages' })}
          </LinkButton>
        </div>
      </div>
    </div>
  );
};

export default AdminArmorTypes;
