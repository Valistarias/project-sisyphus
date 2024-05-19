import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../../providers';

import { Ali, Atitle, Aul } from '../../../atoms';
import { Button } from '../../../molecules';

import { classTrim } from '../../../utils';

import './adminGlobalValues.scss';

const AdminGlobalValues: FC = () => {
  const { t } = useTranslation();
  const { globalValues } = useGlobalVars();

  // TODO: Handle i18n in place of basic english language
  const globalValuesList = useMemo(() => {
    if (globalValues === null || globalValues.length === 0) {
      return null;
    }
    return (
      <Aul className="adminGlobalValues__global-value-list" noPoints>
        {globalValues.map((globalValue) => (
          <Ali
            className={classTrim(`
              adminGlobalValues__global-value-list__elt
            `)}
            key={globalValue._id}
          >
            <Atitle level={3}>{globalValue.name}</Atitle>
            <Button href={`/admin/globalvalue/${globalValue._id}`}>
              {t('adminGlobalValues.editGlobalValue', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [globalValues, t]);

  return (
    <div className="adminGlobalValues">
      <Atitle level={1}>{t('adminGlobalValues.title', { ns: 'pages' })}</Atitle>
      <div className="adminGlobalValues__content">
        <div className="adminGlobalValues__global-values">
          <Atitle level={2}>{t('adminGlobalValues.list', { ns: 'pages' })}</Atitle>
          <div className="adminGlobalValues__global-values__list">{globalValuesList}</div>
          <Button href="/admin/globalvalue/new">
            {t('adminNewGlobalValue.title', { ns: 'pages' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminGlobalValues;
