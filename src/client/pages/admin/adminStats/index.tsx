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

import './adminStats.scss';

const AdminStats: FC = () => {
  const { t } = useTranslation();
  const { stats } = useGlobalVars();

  // Handle i18n in place of basic english language
  const statsList = useMemo(() => {
    if (stats === null || stats.length === 0) {
      return null;
    }

    return (
      <Aul className="adminStats__stat-list" noPoints>
        {stats.map(({ stat }) => (
          <Ali
            className={classTrim(`
              adminStats__stat-list__elt
            `)}
            key={stat._id}
          >
            <Atitle level={3}>{stat.title}</Atitle>
            <Button href={`/admin/stat/${stat._id}`}>
              {t('adminStats.editStat', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [stats, t]);

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
