import React, { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Atitle } from '../../atoms';
import { LinkButton } from '../../molecules';

import './error.scss';

const Error: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="error">
      <Atitle className="error__title" level={1}>
        {t('error.title', { ns: 'pages' })}
      </Atitle>
      <LinkButton size="large" theme="afterglow" href="/">
        {t('error.cta', { ns: 'pages' })}
      </LinkButton>
    </div>
  );
};

export default Error;
