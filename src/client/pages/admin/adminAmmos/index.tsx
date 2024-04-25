import React, { useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useApi, useSystemAlerts } from '../../../providers';

import { Ali, Ap, Atitle, Aul } from '../../../atoms';
import { Button } from '../../../molecules';
import { Alert } from '../../../organisms';
import { type ICuratedAmmo } from '../../../types';

import { classTrim } from '../../../utils';

import './adminAmmos.scss';

const AdminAmmos: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const calledApi = useRef(false);

  const [ammos, setAmmos] = useState<ICuratedAmmo[]>([]);

  // TODO: Handle i18n in place of basic english language
  // TODO: Display all branches on one ammo
  const ammosList = useMemo(() => {
    if (ammos === null || ammos.length === 0) {
      return null;
    }
    return (
      <Aul className="adminAmmos__ammo-list" noPoints>
        {ammos.map(({ ammo }) => (
          <Ali
            className={classTrim(`
              adminAmmos__ammo-list__elt
            `)}
            key={ammo._id}
          >
            <Atitle level={3}>{ammo.title}</Atitle>
            <Button href={`/admin/ammo/${ammo._id}`}>
              {t('adminAmmos.editAmmo', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [ammos, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.ammos
        .getAll()
        .then((curatedAmmos: ICuratedAmmo[]) => {
          setAmmos(curatedAmmos);
        })
        .catch(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            ),
          });
        });
    }
  }, [api, createAlert, getNewId, t]);

  return (
    <div className="adminAmmos">
      <Atitle level={1}>{t('adminAmmos.title', { ns: 'pages' })}</Atitle>
      <div className="adminAmmos__content">
        <div className="adminAmmos__ammos">
          <Atitle level={2}>{t('adminAmmos.list', { ns: 'pages' })}</Atitle>
          <div className="adminAmmos__ammos__list">{ammosList}</div>
          <Button href="/admin/ammo/new">{t('adminNewAmmo.title', { ns: 'pages' })}</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAmmos;
