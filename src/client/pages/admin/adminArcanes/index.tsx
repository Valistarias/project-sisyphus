import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../../providers';

import { Ali, Atitle, Aul } from '../../../atoms';
import { LinkButton } from '../../../molecules';

import { classTrim, romanize } from '../../../utils';

import './adminArcanes.scss';

const AdminArcanes: FC = () => {
  const { t } = useTranslation();
  const { arcanes } = useGlobalVars();

  // TODO: Handle i18n in place of basic english language
  const arcanesList = useMemo(() => {
    if (arcanes.length === 0) {
      return null;
    }

    return (
      <Aul className="adminArcanes__arcane-list" noPoints>
        {arcanes.map(({ arcane }) => (
          <Ali
            className={classTrim(`
              adminArcanes__arcane-list__elt
            `)}
            key={arcane._id}
          >
            <Atitle level={3}>{`${romanize(arcane.number)} - ${arcane.title}`}</Atitle>
            <LinkButton href={`/admin/arcane/${arcane._id}`}>
              {t('adminArcanes.editArcane', { ns: 'pages' })}
            </LinkButton>
          </Ali>
        ))}
      </Aul>
    );
  }, [arcanes, t]);

  return (
    <div className="adminArcanes">
      <Atitle level={1}>{t('adminArcanes.title', { ns: 'pages' })}</Atitle>
      <div className="adminArcanes__content">
        <div className="adminArcanes__arcanes">
          <Atitle level={2}>{t('adminArcanes.list', { ns: 'pages' })}</Atitle>
          <div className="adminArcanes__arcanes__list">{arcanesList}</div>
          <LinkButton href="/admin/arcane/new">
            {t('adminNewArcane.title', { ns: 'pages' })}
          </LinkButton>
        </div>
      </div>
    </div>
  );
};

export default AdminArcanes;
