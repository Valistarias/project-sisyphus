import React, { useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useApi, useSystemAlerts } from '../../providers';

import { Ali, Ap, Atitle, Aul } from '../../atoms';
import { Button } from '../../molecules';
import { Alert } from '../../organisms';
import { type ICuratedSkill } from '../../types';

import { classTrim } from '../../utils';

import './adminSkills.scss';

const AdminSkills: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const calledApi = useRef<boolean>(false);

  const [skills, setSkills] = useState<ICuratedSkill[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle i18n in place of basic english language
  const skillsList = useMemo(() => {
    if (skills === null || skills.length === 0) {
      return null;
    }
    return (
      <Aul className="adminSkills__skill-list" noPoints>
        {skills.map(({ skill }) => (
          <Ali
            className={classTrim(`
              adminSkills__skill-list__elt
            `)}
            key={skill._id}
          >
            <Atitle level={3}>{skill.title}</Atitle>
            <Button href={`/admin/skill/${skill._id}`}>
              {t('adminSkills.editSkill', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [skills, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.skills
        .getAll()
        .then((res: ICuratedSkill[]) => {
          setLoading(false);
          setSkills(res ?? []);
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
    <div className="adminSkills">
      <Atitle level={1}>{t('adminSkills.title', { ns: 'pages' })}</Atitle>
      <div className="adminSkills__content">
        <div className="adminSkills__books">
          <Atitle level={2}>{t('adminSkills.list', { ns: 'pages' })}</Atitle>
          <div className="adminSkills__books__list">{skillsList}</div>
          <Button href="/admin/skill/new">{t('adminNewStat.title', { ns: 'pages' })}</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSkills;
