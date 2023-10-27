import React, { type FC, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { useApi } from '../../providers/api';

import { type IRuleBook } from '../../interfaces';

import './adminRuleBooks.scss';

const AdminRuleBooks: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();

  useEffect(() => {
    if (api !== undefined) {
      api.ruleBooks.getAll()
        .then((data: IRuleBook[]) => {
          console.log('data', data);
        })
        .catch(({ response }) => {
          const { data } = response;
          console.log('data', data);
        });
    }
  }, [api]);

  return (
    <div className="adminRuleBooks">
      <h1>{t('adminRuleBooks.title', { ns: 'pages' })}</h1>
    </div>
  );
};

export default AdminRuleBooks;
