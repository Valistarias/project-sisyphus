import React, {
  useMemo, type FC
} from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../../providers';

import {
  Ali, Atitle, Aul
} from '../../../atoms';
import { Button } from '../../../molecules';

import { classTrim } from '../../../utils';

import './adminProgramScopes.scss';

const AdminProgramScopes: FC = () => {
  const { t } = useTranslation();
  const { programScopes } = useGlobalVars();

  // TODO: Handle i18n in place of basic english language
  const programScopesList = useMemo(() => {
    if (programScopes.length === 0) {
      return null;
    }

    return (
      <Aul className="adminProgramScopes__program-scope-list" noPoints>
        {programScopes.map(({ programScope }) => (
          <Ali
            className={classTrim(`
              adminProgramScopes__program-scope-list__elt
            `)}
            key={programScope._id}
          >
            <Atitle level={3}>{programScope.title}</Atitle>
            <Button href={`/admin/programscope/${programScope._id}`}>
              {t('adminProgramScopes.editProgramScope', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [programScopes, t]);

  return (
    <div className="adminProgramScopes">
      <Atitle level={1}>{t('adminProgramScopes.title', { ns: 'pages' })}</Atitle>
      <div className="adminProgramScopes__content">
        <div className="adminProgramScopes__program-scopes">
          <Atitle level={2}>{t('adminProgramScopes.list', { ns: 'pages' })}</Atitle>
          <div className="adminProgramScopes__program-scopes__list">{programScopesList}</div>
          <Button href="/admin/programscope/new">
            {t('adminNewProgramScope.title', { ns: 'pages' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminProgramScopes;
