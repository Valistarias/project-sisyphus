import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../../providers';

import { Ali, Atitle, Aul } from '../../../atoms';
import { LinkButton } from '../../../molecules';

import './adminBasicActions.scss';
import { classTrim } from '../../../utils';

const AdminBasicActions: FC = () => {
  const { t } = useTranslation();
  const { basicActions } = useGlobalVars();

  // Handle i18n in place of basic english language
  const basicActionsList = useMemo(() => {
    if (basicActions.length === 0) {
      return null;
    }

    return (
      <Aul className="adminBasicActions__basicAction-list" noPoints>
        {basicActions.map(({ action }) => (
          <Ali
            className={classTrim(`
              adminBasicActions__basicAction-list__elt
            `)}
            key={action._id}
          >
            <Atitle level={3}>{action.title}</Atitle>
            <LinkButton href={`/admin/basicaction/${action._id}`}>
              {t('adminBasicActions.editBasicAction', { ns: 'pages' })}
            </LinkButton>
          </Ali>
        ))}
      </Aul>
    );
  }, [basicActions, t]);

  return (
    <div className="adminBasicActions">
      <Atitle level={1}>{t('adminBasicActions.title', { ns: 'pages' })}</Atitle>
      <div className="adminBasicActions__content">
        <div className="adminBasicActions__books">
          <Atitle level={2}>{t('adminBasicActions.list', { ns: 'pages' })}</Atitle>
          <div className="adminBasicActions__books__list">{basicActionsList}</div>
          <LinkButton href="/admin/basicaction/new">
            {t('adminNewBasicAction.title', { ns: 'pages' })}
          </LinkButton>
        </div>
      </div>
    </div>
  );
};

export default AdminBasicActions;
