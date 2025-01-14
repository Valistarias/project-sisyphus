import React, {
  useMemo, type FC
} from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../../providers';

import {
  Ali, Ap, Atitle, Aul
} from '../../../atoms';
import { Button } from '../../../molecules';

import { classTrim } from '../../../utils';

import './ruleBooks.scss';

const RuleBooks: FC = () => {
  const { t } = useTranslation();
  const { ruleBooks } = useGlobalVars();

  const ruleBookList = useMemo(() => {
    if (ruleBooks.length === 0) {
      return null;
    }

    return (
      <Aul className="rulebooks__rulebook-list" noPoints>
        {ruleBooks.map(({ ruleBook }) => (
          <Ali
            className={classTrim(`
              rulebooks__rulebook-list__elt
              ${ruleBook.archived ? 'rulebooks__rulebook-list__elt--archived' : ''}
            `)}
            key={ruleBook._id}
          >
            <Atitle level={3}>{ruleBook.title}</Atitle>
            <Ap>{t(`ruleBookTypeNames.${ruleBook.type.name}`, { count: 1 })}</Ap>
            <Ap className="rulebooks__rulebook-list__elt__details">
              {`${
                ruleBook.archived ? t('terms.ruleBook.archived') : ''
              } ${ruleBook.draft ? t('terms.ruleBook.draft') : ''}`}
            </Ap>
            <Button href={`/rulebook/${ruleBook._id}`}>
              {t('ruleBooks.openRuleBook', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [ruleBooks, t]);

  return (
    <div className="rulebooks">
      <Atitle level={1}>{t('ruleBooks.title', { ns: 'pages' })}</Atitle>
      <div className="rulebooks__books__list">{ruleBookList}</div>
    </div>
  );
};

export default RuleBooks;
