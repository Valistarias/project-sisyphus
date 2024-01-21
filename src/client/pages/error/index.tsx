import React, { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Atitle } from '../../atoms';
import { Button } from '../../molecules';

import './error.scss';

const Error: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="error">
      <Atitle className="error__title" level={1}>
        {t('error.title', { ns: 'pages' })}
      </Atitle>
      <Button size="large" theme="afterglow" href="/">
        {t('error.cta', { ns: 'pages' })}
      </Button>
    </div>
  );
};

export default Error;
