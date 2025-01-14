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
import { Button } from '../../../molecules';
import { Alert } from '../../../organisms';

import type { ICuratedBag } from '../../../types';

import { classTrim } from '../../../utils';

import './adminBags.scss';

const AdminBags: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();

  const calledApi = useRef(false);

  const [bags, setBags] = useState<ICuratedBag[]>([]);

  // TODO: Handle i18n in place of basic english language
  // TODO: Display all branches on one bag
  const bagsList = useMemo(() => {
    if (bags === null || bags.length === 0) {
      return null;
    }

    return (
      <Aul className="adminBags__bag-list" noPoints>
        {bags.map(({ bag }) => (
          <Ali
            className={classTrim(`
              adminBags__bag-list__elt
            `)}
            key={bag._id}
          >
            <Atitle level={3}>{bag.title}</Atitle>
            <Button href={`/admin/bag/${bag._id}`}>
              {t('adminBags.editBag', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [bags, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.bags
        .getAll()
        .then((curatedBags: ICuratedBag[]) => {
          setBags(curatedBags);
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
    <div className="adminBags">
      <Atitle level={1}>{t('adminBags.title', { ns: 'pages' })}</Atitle>
      <div className="adminBags__content">
        <div className="adminBags__bags">
          <Atitle level={2}>{t('adminBags.list', { ns: 'pages' })}</Atitle>
          <div className="adminBags__bags__list">{bagsList}</div>
          <Button href="/admin/bag/new">{t('adminNewBag.title', { ns: 'pages' })}</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminBags;
