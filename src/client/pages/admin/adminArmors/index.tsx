import React, { useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useApi, useSystemAlerts } from '../../../providers';

import { Ali, Ap, Atitle, Aul } from '../../../atoms';
import { Button } from '../../../molecules';
import { Alert } from '../../../organisms';

import type { ICuratedArmor } from '../../../types';

import { classTrim } from '../../../utils';

import './adminArmors.scss';

const AdminArmors: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const calledApi = useRef(false);

  const [armors, setArmors] = useState<ICuratedArmor[]>([]);

  // TODO: Handle i18n in place of basic english language
  const armorsList = useMemo(() => {
    if (armors === null || armors.length === 0) {
      return null;
    }

    return (
      <Aul className="adminArmors__armor-list" noPoints>
        {armors.map(({ armor }) => (
          <Ali
            className={classTrim(`
              adminArmors__armor-list__elt
            `)}
            key={armor._id}
          >
            <Atitle level={3}>{armor.title}</Atitle>
            <Button href={`/admin/armor/${armor._id}`}>
              {t('adminArmors.editArmor', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [armors, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.armors
        .getAll()
        .then((curatedArmors: ICuratedArmor[]) => {
          setArmors(curatedArmors);
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
  }, [api, createAlert, getNewId, t]);

  return (
    <div className="adminArmors">
      <Atitle level={1}>{t('adminArmors.title', { ns: 'pages' })}</Atitle>
      <div className="adminArmors__content">
        <div className="adminArmors__armors">
          <Atitle level={2}>{t('adminArmors.list', { ns: 'pages' })}</Atitle>
          <div className="adminArmors__armors__list">{armorsList}</div>
          <Button href="/admin/armor/new">{t('adminNewArmor.title', { ns: 'pages' })}</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminArmors;
