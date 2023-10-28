import React, { type FC } from 'react';

import { useTranslation } from 'react-i18next';
import { useApi } from '../../providers/api';

import { Atitle } from '../../atoms';

import { RichTextElement } from '../../organisms';

import './adminNewRuleBook.scss';

const AdminNewRuleBooks: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();

  return (
    <div className="adminNewRuleBook">
      <Atitle level={1}>{t('adminNewRuleBook.title', { ns: 'pages' })}</Atitle>
      <RichTextElement />
    </div>
  );
};

export default AdminNewRuleBooks;
