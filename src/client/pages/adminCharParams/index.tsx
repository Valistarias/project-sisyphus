import React, { useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useApi, useSystemAlerts } from '../../providers';

import { Ali, Ap, Atitle, Aul } from '../../atoms';
import { Button } from '../../molecules';
import { Alert } from '../../organisms';
import { type ICuratedCharParam } from '../../types';

import { classTrim } from '../../utils';

import './adminCharParams.scss';

const AdminCharParams: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const calledApi = useRef<boolean>(false);

  const [charParams, setCharParams] = useState<ICuratedCharParam[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle i18n in place of basic english language
  const charParamsList = useMemo(() => {
    if (charParams === null || charParams.length === 0) {
      return null;
    }
    return (
      <Aul className="adminCharParams__charParam-list" noPoints>
        {charParams.map(({ charParam }) => (
          <Ali
            className={classTrim(`
              adminCharParams__charParam-list__elt
            `)}
            key={charParam._id}
          >
            <Atitle level={3}>{charParam.title}</Atitle>
            <Button href={`/admin/charParam/${charParam._id}`}>
              {t('adminCharParams.editCharParam', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [charParams, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.charParams
        .getAll()
        .then((res: ICuratedCharParam[]) => {
          setLoading(false);
          setCharParams(res ?? []);
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
    <div className="adminCharParams">
      <Atitle level={1}>{t('adminCharParams.title', { ns: 'pages' })}</Atitle>
      <div className="adminCharParams__content">
        <div className="adminCharParams__books">
          <Atitle level={2}>{t('adminCharParams.list', { ns: 'pages' })}</Atitle>
          <div className="adminCharParams__books__list">{charParamsList}</div>
          <Button href="/admin/charParam/new">
            {t('adminNewCharParam.title', { ns: 'pages' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminCharParams;
