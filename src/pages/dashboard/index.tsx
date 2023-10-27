import React, { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Atitle } from '../../atoms';

import './dashboard.scss';

const Dashboard: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="dashboard">
      <Atitle level={1}>{t('dashboard.title', { ns: 'pages' })}</Atitle>
    </div>
  );
};

export default Dashboard;
