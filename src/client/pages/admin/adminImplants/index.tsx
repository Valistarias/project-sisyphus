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

import type { ICuratedImplant } from '../../../types';

import { classTrim } from '../../../utils';

import './adminImplants.scss';

const AdminImplants: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();

  const calledApi = useRef(false);

  const [implants, setImplants] = useState<ICuratedImplant[]>([]);

  // TODO: Handle i18n in place of basic english language
  const implantsList = useMemo(() => {
    if (implants.length === 0) {
      return null;
    }

    return (
      <Aul className="adminImplants__implant-list" noPoints>
        {implants.map(({ implant }) => (
          <Ali
            className={classTrim(`
              adminImplants__implant-list__elt
            `)}
            key={implant._id}
          >
            <Atitle level={3}>{implant.title}</Atitle>
            <LinkButton href={`/admin/implant/${implant._id}`}>
              {t('adminImplants.editImplant', { ns: 'pages' })}
            </LinkButton>
          </Ali>
        ))}
      </Aul>
    );
  }, [implants, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.implants
        .getAll()
        .then((curatedImplants) => {
          setImplants(curatedImplants);
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
    <div className="adminImplants">
      <Atitle level={1}>{t('adminImplants.title', { ns: 'pages' })}</Atitle>
      <div className="adminImplants__content">
        <div className="adminImplants__implants">
          <Atitle level={2}>{t('adminImplants.list', { ns: 'pages' })}</Atitle>
          <div className="adminImplants__implants__list">{implantsList}</div>
          <LinkButton href="/admin/implant/new">{t('adminNewImplant.title', { ns: 'pages' })}</LinkButton>
        </div>
      </div>
    </div>
  );
};

export default AdminImplants;
