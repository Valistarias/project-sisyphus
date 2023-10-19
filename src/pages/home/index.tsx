import React, { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import './home.scss';

const Home: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="home">
      <h1>{t('home.title', { ns: 'pages' })}</h1>
    </div>
  );
};

export default Home;
