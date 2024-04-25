import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../../providers';

import { Ali, Atitle, Aul } from '../../../atoms';
import { Button } from '../../../molecules';

import { classTrim } from '../../../utils';

import './adminBodyParts.scss';

const AdminBodyParts: FC = () => {
  const { t } = useTranslation();
  const { bodyParts } = useGlobalVars();

  // TODO: Handle i18n in place of basic english language
  const bodyPartsList = useMemo(() => {
    if (bodyParts === null || bodyParts.length === 0) {
      return null;
    }
    return (
      <Aul className="adminBodyParts__body-part-list" noPoints>
        {bodyParts.map(({ bodyPart }) => (
          <Ali
            className={classTrim(`
              adminBodyParts__body-part-list__elt
            `)}
            key={bodyPart._id}
          >
            <Atitle level={3}>{bodyPart.title}</Atitle>
            <Button href={`/admin/bodypart/${bodyPart._id}`}>
              {t('adminBodyParts.editBodyPart', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [bodyParts, t]);

  return (
    <div className="adminBodyParts">
      <Atitle level={1}>{t('adminBodyParts.title', { ns: 'pages' })}</Atitle>
      <div className="adminBodyParts__content">
        <div className="adminBodyParts__body-parts">
          <Atitle level={2}>{t('adminBodyParts.list', { ns: 'pages' })}</Atitle>
          <div className="adminBodyParts__body-parts__list">{bodyPartsList}</div>
          <Button href="/admin/bodypart/new">{t('adminNewBodyPart.title', { ns: 'pages' })}</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminBodyParts;
