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

import type { ICuratedBasicNPC } from '../../../types';

import { classTrim } from '../../../utils';

import './adminNPCs.scss';

const AdminNPCs: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();

  const calledApi = useRef(false);

  const [nPCs, setNPCs] = useState<ICuratedBasicNPC[]>([]);

  // TODO: Handle i18n in place of basic english language
  const nPCsList = useMemo(() => {
    if (nPCs === null || nPCs.length === 0) {
      return null;
    }

    return (
      <Aul className="adminNPCs__nPC-list" noPoints>
        {nPCs.map(({ nPC }) => (
          <Ali
            className={classTrim(`
              adminNPCs__nPC-list__elt
            `)}
            key={nPC._id}
          >
            <Atitle level={3}>{nPC.title}</Atitle>
            <Button href={`/admin/npc/${nPC._id}`}>
              {t('adminNPCs.editNPC', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [nPCs, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.nPCs
        .getAllBasic()
        .then((curatedNPCs: ICuratedBasicNPC[]) => {
          setNPCs(curatedNPCs);
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
    <div className="adminNPCs">
      <Atitle level={1}>{t('adminNPCs.title', { ns: 'pages' })}</Atitle>
      <div className="adminNPCs__content">
        <div className="adminNPCs__nPCs">
          <Atitle level={2}>{t('adminNPCs.list', { ns: 'pages' })}</Atitle>
          <div className="adminNPCs__nPCs__list">{nPCsList}</div>
          <Button href="/admin/nPC/new">{t('adminNewNPC.title', { ns: 'pages' })}</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminNPCs;
