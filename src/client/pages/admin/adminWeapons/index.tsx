import React, { useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useApi, useSystemAlerts } from '../../../providers';

import { Ali, Ap, Atitle, Aul } from '../../../atoms';
import { LinkButton } from '../../../molecules';
import { Alert } from '../../../organisms';

import type { ICuratedWeapon } from '../../../types';

import { classTrim } from '../../../utils';

import './adminWeapons.scss';

const AdminWeapons: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const calledApi = useRef(false);

  const [weapons, setWeapons] = useState<ICuratedWeapon[]>([]);

  // TODO: Handle i18n in place of basic english language
  const weaponsList = useMemo(() => {
    if (weapons.length === 0) {
      return null;
    }

    return (
      <Aul className="adminWeapons__weapon-list" noPoints>
        {weapons.map(({ weapon }) => (
          <Ali
            className={classTrim(`
              adminWeapons__weapon-list__elt
            `)}
            key={weapon._id}
          >
            <Atitle level={3}>{weapon.title}</Atitle>
            <LinkButton href={`/admin/weapon/${weapon._id}`}>
              {t('adminWeapons.editWeapon', { ns: 'pages' })}
            </LinkButton>
          </Ali>
        ))}
      </Aul>
    );
  }, [weapons, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.weapons
        .getAll()
        .then((curatedWeapons) => {
          setWeapons(curatedWeapons);
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
    <div className="adminWeapons">
      <Atitle level={1}>{t('adminWeapons.title', { ns: 'pages' })}</Atitle>
      <div className="adminWeapons__content">
        <div className="adminWeapons__weapons">
          <Atitle level={2}>{t('adminWeapons.list', { ns: 'pages' })}</Atitle>
          <div className="adminWeapons__weapons__list">{weaponsList}</div>
          <LinkButton href="/admin/weapon/new">
            {t('adminNewWeapon.title', { ns: 'pages' })}
          </LinkButton>
        </div>
      </div>
    </div>
  );
};

export default AdminWeapons;
