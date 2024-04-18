import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ali, Atitle, Aul } from '../../atoms';
import { Button } from '../../molecules';

import { classTrim } from '../../utils';

import './adminItemModifiers.scss';

const AdminItemModifiers: FC = () => {
  const { t } = useTranslation();
  const { itemModifiers } = useGlobalVars();

  // TODO: Handle i18n in place of basic english language
  const itemModifiersList = useMemo(() => {
    if (itemModifiers === null || itemModifiers.length === 0) {
      return null;
    }
    return (
      <Aul className="adminItemModifiers__item-modifier-list" noPoints>
        {itemModifiers.map(({ itemModifier }) => (
          <Ali
            className={classTrim(`
              adminItemModifiers__item-modifier-list__elt
            `)}
            key={itemModifier._id}
          >
            <Atitle level={3}>{itemModifier.title}</Atitle>
            <Button href={`/admin/itemmodifier/${itemModifier._id}`}>
              {t('adminItemModifiers.editItemModifier', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [itemModifiers, t]);

  return (
    <div className="adminItemModifiers">
      <Atitle level={1}>{t('adminItemModifiers.title', { ns: 'pages' })}</Atitle>
      <div className="adminItemModifiers__content">
        <div className="adminItemModifiers__books">
          <Atitle level={2}>{t('adminItemModifiers.list', { ns: 'pages' })}</Atitle>
          <div className="adminItemModifiers__books__list">{itemModifiersList}</div>
          <Button href="/admin/itemmodifier/new">
            {t('adminNewItemModifier.title', { ns: 'pages' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminItemModifiers;
