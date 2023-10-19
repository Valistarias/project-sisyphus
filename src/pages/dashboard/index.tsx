import React, { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import './dashboard.scss';

const Dashboard: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="dashboard">
      <h1>{t('dashboard.title', { ns: 'pages' })}</h1>
    </div>
  );
};

export default Dashboard;
