import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ali, Ap, Atitle, Aul } from '../../atoms';
import { Button } from '../../molecules';

import AdminRuleBookTypes from './adminRuleBookTypes';

import { classTrim } from '../../utils';

import './adminRuleBooks.scss';

const AdminRuleBooks: FC = () => {
  const { t } = useTranslation();
  const { ruleBooks } = useGlobalVars();

  // Handle i18n in place of basic english language
  const ruleBookList = useMemo(() => {
    if (ruleBooks.length === 0) {
      return null;
    }
    return (
      <Aul className="adminRuleBooks__rulebook-list" noPoints>
        {ruleBooks.map(({ ruleBook }) => (
          <Ali
            className={classTrim(`
              adminRuleBooks__rulebook-list__elt
              ${ruleBook.archived ? 'adminRuleBooks__rulebook-list__elt--archived' : ''}
            `)}
            key={ruleBook._id}
          >
            <Atitle level={3}>{ruleBook.title}</Atitle>
            <Ap className="adminRuleBooks__rulebook-list__elt__type">
              {t(`ruleBookTypeNames.${ruleBook.type.name}`, { count: 1 })}
            </Ap>
            <Ap className="adminRuleBooks__rulebook-list__elt__details">{`${
              ruleBook.archived ? t('terms.ruleBook.archived') : ''
            } ${ruleBook.draft ? t('terms.ruleBook.draft') : ''}`}</Ap>
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
