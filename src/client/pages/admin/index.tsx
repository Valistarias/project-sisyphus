import React, { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Aa, Atitle } from '../../atoms';

import './admin.scss';

const Admin: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="admin">
      <Atitle level={1}>{t('admin.title', { ns: 'pages' })}</Atitle>
      <Aa href="/admin/rulebooks">{t('adminRuleBooks.title', { ns: 'pages' })}</Aa>
    </div>
  );
};

export default Admin;
