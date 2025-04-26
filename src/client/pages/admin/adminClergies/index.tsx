import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../../providers';

import { Ali, Atitle, Aul } from '../../../atoms';
import { LinkButton } from '../../../molecules';

import { classTrim } from '../../../utils';

import './adminClergies.scss';

const AdminClergies: FC = () => {
  const { t } = useTranslation();
  const { clergies } = useGlobalVars();

  // TODO: Handle i18n in place of basic english language
  // TODO: Display all branches on one cyber frame
  const clergiesList = useMemo(() => {
    if (clergies.length === 0) {
      return null;
    }

    return (
      <Aul className="adminClergies__clergy-list" noPoints>
        {clergies.map(({ clergy }) => (
          <Ali
            className={classTrim(`
              adminClergies__clergy-list__elt
            `)}
            key={clergy._id}
          >
            <Atitle level={3}>{clergy.title}</Atitle>
            <LinkButton href={`/admin/clergy/${clergy._id}`}>
              {t('adminClergies.editClergy', { ns: 'pages' })}
            </LinkButton>
          </Ali>
        ))}
      </Aul>
    );
  }, [clergies, t]);

  return (
    <div className="adminClergies">
      <Atitle level={1}>{t('adminClergies.title', { ns: 'pages' })}</Atitle>
      <div className="adminClergies__content">
        <div className="adminClergies__frames">
          <Atitle level={2}>{t('adminClergies.list', { ns: 'pages' })}</Atitle>
          <div className="adminClergies__frames__list">{clergiesList}</div>
          <LinkButton href="/admin/clergy/new">
            {t('adminNewClergy.title', { ns: 'pages' })}
          </LinkButton>
        </div>
      </div>
    </div>
  );
};

export default AdminClergies;
