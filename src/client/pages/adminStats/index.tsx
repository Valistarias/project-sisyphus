import React, { useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useApi, useSystemAlerts } from '../../providers';

import { Ali, Ap, Atitle, Aul } from '../../atoms';
import { Button } from '../../molecules';
import { Alert } from '../../organisms';
import { type ICuratedCyberFrame } from '../../types';

import { classTrim } from '../../utils';

import './adminStats.scss';

const AdminStats: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const calledApi = useRef<boolean>(false);

  const [stats, setStats] = useState<ICuratedCyberFrame[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle i18n in place of basic english language
  const statsList = useMemo(() => {
    if (stats === null || stats.length === 0) {
      return null;
    }
    return (
      <Aul className="adminStats__stat-list" noPoints>
        {stats.map(({ cyberFrame }) => (
          <Ali
            className={classTrim(`
              adminStats__stat-list__elt
            `)}
            key={cyberFrame._id}
          >
            <Atitle level={3}>{cyberFrame.title}</Atitle>
            {/* <Ap className="adminStats__stat-list__elt__details">{`${
              cyberFrame.archived ? t('terms.cyberFrame.archived') : ''
            } ${cyberFrame.draft ? t('terms.cyberFrame.draft') : ''}`}</Ap> */}
            <Button href={`/admin/stat/${cyberFrame._id}`}>
              {t('adminStats.editStat', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [stats, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.stats
        .getAll()
        .then((res: ICuratedCyberFrame[]) => {
          setLoading(false);
          setStats(res ?? []);
        })
        .catch((res) => {
          setLoading(false);
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

  if (loading) {
    return null;
  }

  return (
    <div className="adminStats">
      <Atitle level={1}>{t('adminStats.title', { ns: 'pages' })}</Atitle>
      <div className="adminStats__content">
        <div className="adminStats__books">
          <Atitle level={2}>{t('adminStats.list', { ns: 'pages' })}</Atitle>
          <div className="adminStats__books__list">{statsList}</div>
          <Button href="/admin/stat/new">{t('adminNewStat.title', { ns: 'pages' })}</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
