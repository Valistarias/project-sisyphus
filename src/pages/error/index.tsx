import React, { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Atitle } from '../../atoms';

import './error.scss';

const Error: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="error">
      <Atitle level={1}>{t('error.title', { ns: 'pages' })}</Atitle>
    </div>
  );
};

export default Error;
