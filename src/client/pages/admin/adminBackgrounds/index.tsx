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

import type { ICuratedBackground } from '../../../types';

import { classTrim } from '../../../utils';

import './adminBackgrounds.scss';

const AdminBackgrounds: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();

  const calledApi = useRef(false);

  const [backgrounds, setBackgrounds] = useState<ICuratedBackground[]>([]);

  // TODO: Handle i18n in place of basic english language
  const backgroundsList = useMemo(() => {
    if (backgrounds === null || backgrounds.length === 0) {
      return null;
    }

    return (
      <Aul className="adminBackgrounds__background-list" noPoints>
        {backgrounds.map(({ background }) => (
          <Ali
            className={classTrim(`
              adminBackgrounds__background-list__elt
            `)}
            key={background._id}
          >
            <Atitle level={3}>{background.title}</Atitle>
            <Button href={`/admin/background/${background._id}`}>
              {t('adminBackgrounds.editBackground', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [backgrounds, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.backgrounds
        .getAll()
        .then((curatedBackgrounds: ICuratedBackground[]) => {
          setBackgrounds(curatedBackgrounds);
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
    <div className="adminBackgrounds">
      <Atitle level={1}>{t('adminBackgrounds.title', { ns: 'pages' })}</Atitle>
      <div className="adminBackgrounds__content">
        <div className="adminBackgrounds__backgrounds">
          <Atitle level={2}>{t('adminBackgrounds.list', { ns: 'pages' })}</Atitle>
          <div className="adminBackgrounds__backgrounds__list">{backgroundsList}</div>
          <Button href="/admin/background/new">
            {t('adminNewBackground.title', { ns: 'pages' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminBackgrounds;
