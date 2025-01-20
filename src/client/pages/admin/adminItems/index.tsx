import React, {
  useEffect, useMemo, useRef, useState, type FC
} from 'react';

import { useTranslation } from 'react-i18next';

import {
  useApi, useSystemAlerts
} from '../../../providers';

import {
  Ali, Ap, Atitle, Aul
} from '../../../atoms';
import { LinkButton } from '../../../molecules';
import { Alert } from '../../../organisms';

import type { ICuratedItem } from '../../../types';

import { classTrim } from '../../../utils';

import './adminItems.scss';

const AdminItems: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();

  const calledApi = useRef(false);

  const [items, setItems] = useState<ICuratedItem[]>([]);

  // TODO: Handle i18n in place of basic english language
  const itemsList = useMemo(() => {
    if (items.length === 0) {
      return null;
    }

    return (
      <Aul className="adminItems__item-list" noPoints>
        {items.map(({ item }) => (
          <Ali
            className={classTrim(`
              adminItems__item-list__elt
            `)}
            key={item._id}
          >
            <Atitle level={3}>{item.title}</Atitle>
            <LinkButton href={`/admin/item/${item._id}`}>
              {t('adminItems.editItem', { ns: 'pages' })}
            </LinkButton>
          </Ali>
        ))}
      </Aul>
    );
  }, [items, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.items
        .getAll()
        .then((curatedItems) => {
          setItems(curatedItems);
        })
        .catch(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            )
          });
        });
    }
  }, [
    api,
    createAlert,
    getNewId,
    t
  ]);

  return (
    <div className="adminItems">
      <Atitle level={1}>{t('adminItems.title', { ns: 'pages' })}</Atitle>
      <div className="adminItems__content">
        <div className="adminItems__items">
          <Atitle level={2}>{t('adminItems.list', { ns: 'pages' })}</Atitle>
          <div className="adminItems__items__list">{itemsList}</div>
          <LinkButton href="/admin/item/new">{t('adminNewItem.title', { ns: 'pages' })}</LinkButton>
        </div>
      </div>
    </div>
  );
};

export default AdminItems;
