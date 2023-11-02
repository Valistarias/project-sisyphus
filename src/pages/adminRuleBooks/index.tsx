import React, { type FC, useEffect, useState, useRef, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { useApi } from '../../providers/api';
import { useSystemAlerts } from '../../providers/systemAlerts';

import { type ICuratedRuleBook } from '../../interfaces';

import { Ali, Ap, Atitle, Aul } from '../../atoms';
import { Button } from '../../molecules';
import { Alert } from '../../organisms';

import './adminRuleBooks.scss';
import AdminRuleBookTypes from './adminRuleBookTypes';

const AdminRuleBooks: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const calledApi = useRef(false);

  const [ruleBooks, setRuleBooks] = useState<ICuratedRuleBook[]>([]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.ruleBooks
        .getAll()
        .then((data: ICuratedRuleBook[]) => {
          setRuleBooks(data);
        })
        .catch(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            ),
          });
        });
    }
  }, [api, createAlert, getNewId, t]);

  // Handle i18n in place of basic english language
  const ruleBookList = useMemo(() => {
    if (ruleBooks.length === 0) {
      return null;
    }
    return (
      <Aul className="adminRuleBooks__rulebook-list" noPoints>
        {ruleBooks.map(({ ruleBook }) => (
          <Ali className="adminRuleBooks__rulebook-list__elt" key={ruleBook._id}>
            <Atitle level={3}>{ruleBook.title}</Atitle>
            <Ap>{t(`ruleBookTypeNames.${ruleBook.type.name}`, { count: 1 })}</Ap>
            <Button href={`/admin/rulebook/${ruleBook._id}`}>
              {t('adminRuleBooks.editRuleBook', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [ruleBooks, t]);

  return (
    <div className="adminRuleBooks">
      <Atitle level={1}>{t('adminRuleBooks.title', { ns: 'pages' })}</Atitle>
      <div className="adminRuleBooks__content">
        <div className="adminRuleBooks__books">
          <Atitle level={2}>{t('adminRuleBooks.list', { ns: 'pages' })}</Atitle>
          <div className="adminRuleBooks__books__list">{ruleBookList}</div>
          <Button href="/admin/rulebook/new">{t('adminNewRuleBook.title', { ns: 'pages' })}</Button>
        </div>
        <AdminRuleBookTypes />
      </div>
    </div>
  );
};

export default AdminRuleBooks;
