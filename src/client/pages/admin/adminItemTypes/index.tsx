import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../../providers';

import { Ali, Atitle, Aul } from '../../../atoms';
import { LinkButton } from '../../../molecules';

import { classTrim } from '../../../utils';

import './adminItemTypes.scss';

const AdminItemTypes: FC = () => {
  const { t } = useTranslation();
  const { itemTypes } = useGlobalVars();

  // TODO: Handle i18n in place of basic english language
  const itemTypesList = useMemo(() => {
    if (itemTypes.length === 0) {
      return null;
    }

    return (
      <Aul className="adminItemTypes__item-type-list" noPoints>
        {itemTypes.map((itemType) => (
          <Ali
            className={classTrim(`
              adminItemTypes__item-type-list__elt
            `)}
            key={itemType._id}
          >
            <Atitle level={3}>{itemType.name}</Atitle>
            <LinkButton href={`/admin/itemtype/${itemType._id}`}>
              {t('adminItemTypes.editItemType', { ns: 'pages' })}
            </LinkButton>
          </Ali>
        ))}
      </Aul>
    );
  }, [itemTypes, t]);

  return (
    <div className="adminItemTypes">
      <Atitle level={1}>{t('adminItemTypes.title', { ns: 'pages' })}</Atitle>
      <div className="adminItemTypes__content">
        <div className="adminItemTypes__item-types">
          <Atitle level={2}>{t('adminItemTypes.list', { ns: 'pages' })}</Atitle>
          <div className="adminItemTypes__item-types__list">{itemTypesList}</div>
          <LinkButton href="/admin/itemtype/new">
            {t('adminNewItemType.title', { ns: 'pages' })}
          </LinkButton>
        </div>
      </div>
    </div>
  );
};

export default AdminItemTypes;
