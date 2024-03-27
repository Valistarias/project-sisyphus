import React, { useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useApi, useSystemAlerts } from '../../providers';

import { Ali, Ap, Atitle, Aul } from '../../atoms';
import { Button } from '../../molecules';
import { Alert } from '../../organisms';
import { type ICuratedCyberFrame } from '../../types';

import { classTrim } from '../../utils';

import './adminCyberFrames.scss';

const AdminCyberFrames: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const calledApi = useRef<boolean>(false);

  const [cyberFrames, setCyberFrames] = useState<ICuratedCyberFrame[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle i18n in place of basic english language
  const cyberFramesList = useMemo(() => {
    if (cyberFrames === null || cyberFrames.length === 0) {
      return null;
    }
    return (
      <Aul className="adminCyberFrames__cyberframe-list" noPoints>
        {cyberFrames.map(({ cyberFrame }) => (
          <Ali
            className={classTrim(`
              adminCyberFrames__cyberframe-list__elt
            `)}
            key={cyberFrame._id}
          >
            <Atitle level={3}>{cyberFrame.title}</Atitle>
            {/* <Ap className="adminCyberFrames__cyberframe-list__elt__details">{`${
              cyberFrame.archived ? t('terms.cyberFrame.archived') : ''
            } ${cyberFrame.draft ? t('terms.cyberFrame.draft') : ''}`}</Ap> */}
            <Button href={`/admin/cyberframe/${cyberFrame._id}`}>
              {t('adminCyberFrames.editCyberFrame', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [cyberFrames, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.cyberFrames
        .getAll()
        .then((res: ICuratedCyberFrame[]) => {
          setLoading(false);
          setCyberFrames(res ?? []);
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
    <div className="adminCyberFrames">
      <Atitle level={1}>{t('adminCyberFrames.title', { ns: 'pages' })}</Atitle>
      <div className="adminCyberFrames__content">
        <div className="adminCyberFrames__books">
          <Atitle level={2}>{t('adminCyberFrames.list', { ns: 'pages' })}</Atitle>
          <div className="adminCyberFrames__books__list">{cyberFramesList}</div>
          <Button href="/admin/cyberframe/new">
            {t('adminNewCyberFrame.title', { ns: 'pages' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminCyberFrames;
