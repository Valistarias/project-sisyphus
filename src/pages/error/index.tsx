import React, { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import './error.scss';

const Error: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="error">
      <h1>{t('error.title', { ns: 'pages' })}</h1>
    </div>
  );
};

export default Error;
