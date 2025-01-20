import React, {
  useMemo, type FC
} from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../../providers';

import {
  Ali, Atitle, Aul
} from '../../../atoms';
import { Button } from '../../../molecules';

import { classTrim } from '../../../utils';

import './adminCharParams.scss';

const AdminCharParams: FC = () => {
  const { t } = useTranslation();
  const { charParams } = useGlobalVars();

  // Handle i18n in place of basic english language
  const charParamsList = useMemo(() => {
    if (charParams.length === 0) {
      return null;
    }

    return (
      <Aul className="adminCharParams__charParam-list" noPoints>
        {charParams.map(({ charParam }) => (
          <Ali
            className={classTrim(`
              adminCharParams__charParam-list__elt
            `)}
            key={charParam._id}
          >
            <Atitle level={3}>{charParam.title}</Atitle>
            <Button href={`/admin/charParam/${charParam._id}`}>
              {t('adminCharParams.editCharParam', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [charParams, t]);

  return (
    <div className="adminCharParams">
      <Atitle level={1}>{t('adminCharParams.title', { ns: 'pages' })}</Atitle>
      <div className="adminCharParams__content">
        <div className="adminCharParams__books">
          <Atitle level={2}>{t('adminCharParams.list', { ns: 'pages' })}</Atitle>
          <div className="adminCharParams__books__list">{charParamsList}</div>
          <Button href="/admin/charParam/new">
            {t('adminNewCharParam.title', { ns: 'pages' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminCharParams;
