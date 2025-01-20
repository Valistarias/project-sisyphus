import React, {
  useMemo, type FC
} from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../../providers';

import {
  Ali, Atitle, Aul
} from '../../../atoms';
import { LinkButton } from '../../../molecules';

import { classTrim } from '../../../utils';

import './adminSkills.scss';

const AdminSkills: FC = () => {
  const { t } = useTranslation();
  const { skills } = useGlobalVars();

  // TODO: Handle i18n in place of basic english language
  // TODO: Display all branches on one skill
  const skillsList = useMemo(() => {
    if (skills.length === 0) {
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
            <LinkButton href={`/admin/skill/${skill._id}`}>
              {t('adminSkills.editSkill', { ns: 'pages' })}
            </LinkButton>
          </Ali>
        ))}
      </Aul>
    );
  }, [skills, t]);

  return (
    <div className="adminSkills">
      <Atitle level={1}>{t('adminSkills.title', { ns: 'pages' })}</Atitle>
      <div className="adminSkills__content">
        <div className="adminSkills__books">
          <Atitle level={2}>{t('adminSkills.list', { ns: 'pages' })}</Atitle>
          <div className="adminSkills__books__list">{skillsList}</div>
          <LinkButton href="/admin/skill/new">{t('adminNewSkill.title', { ns: 'pages' })}</LinkButton>
        </div>
      </div>
    </div>
  );
};

export default AdminSkills;
