import React, { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Atitle } from '../../atoms';

import './ruleBooks.scss';

const RuleBooks: FC = () => {
  const { t } = useTranslation();
  const { ruleBooks } = useGlobalVars();

  console.log('ruleBooks', ruleBooks);

  return (
    <div className="rulebooks">
      <Atitle level={1}>{t('rulebooks.title', { ns: 'pages' })}</Atitle>
    </div>
  );
};

export default RuleBooks;
