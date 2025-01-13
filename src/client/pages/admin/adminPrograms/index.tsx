import React, { useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useApi, useSystemAlerts } from '../../../providers';

import { Ali, Ap, Atitle, Aul } from '../../../atoms';
import { Button } from '../../../molecules';
import { Alert } from '../../../organisms';

import type { ICuratedProgram } from '../../../types';

import { classTrim } from '../../../utils';

import './adminPrograms.scss';

const AdminPrograms: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const calledApi = useRef(false);

  const [programs, setPrograms] = useState<ICuratedProgram[]>([]);

  // TODO: Handle i18n in place of basic english language
  const programsList = useMemo(() => {
    if (programs === null || programs.length === 0) {
      return null;
    }
    return (
      <Aul className="adminPrograms__program-list" noPoints>
        {programs.map(({ program }) => (
          <Ali
            className={classTrim(`
              adminPrograms__program-list__elt
            `)}
            key={program._id}
          >
            <Atitle level={3}>{program.title}</Atitle>
            <Button href={`/admin/program/${program._id}`}>
              {t('adminPrograms.editProgram', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [programs, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.programs
        .getAll()
        .then((curatedPrograms: ICuratedProgram[]) => {
          setPrograms(curatedPrograms);
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
    <div className="adminPrograms">
      <Atitle level={1}>{t('adminPrograms.title', { ns: 'pages' })}</Atitle>
      <div className="adminPrograms__content">
        <div className="adminPrograms__programs">
          <Atitle level={2}>{t('adminPrograms.list', { ns: 'pages' })}</Atitle>
          <div className="adminPrograms__programs__list">{programsList}</div>
          <Button href="/admin/program/new">{t('adminNewProgram.title', { ns: 'pages' })}</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminPrograms;
