import React, { type FC, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { useApi } from '../../providers/api';

import { type IRuleBook } from '../../interfaces';

import { Atitle } from '../../atoms';

import './adminRuleBooks.scss';
import AdminRuleBookTypes from './adminRuleBookTypes';
import { Button } from '../../molecules';

const AdminRuleBooks: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();

  const [ruleBooks, setRuleBooks] = useState<IRuleBook[]>([]);

  useEffect(() => {
    if (api !== undefined) {
      api.ruleBooks.getAll()
        .then((data: IRuleBook[]) => {
          setRuleBooks(data);
        })
        .catch(({ response }) => {
          // TODO : Error Popup
        });
    }
  }, [api]);

  return (
    <div className="adminRuleBooks">
      <Atitle level={1}>{t('adminRuleBooks.title', { ns: 'pages' })}</Atitle>
      <div className="adminRuleBooks__content">
        <div className="adminRuleBooks__books">
          <Atitle level={2}>{t('adminRuleBooks.list', { ns: 'pages' })}</Atitle>
          <Button href="/admin/rulebook/new">{t('adminNewRuleBook.title', { ns: 'pages' })}</Button>
        </div>
        <AdminRuleBookTypes />
      </div>
    </div>
  );
};

export default AdminRuleBooks;
