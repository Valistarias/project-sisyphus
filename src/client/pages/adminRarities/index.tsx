import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ali, Atitle, Aul } from '../../atoms';
import { Button } from '../../molecules';

import { classTrim } from '../../utils';

import './adminRarities.scss';

const AdminRarities: FC = () => {
  const { t } = useTranslation();
  const { rarities } = useGlobalVars();

  // TODO: Handle i18n in place of basic english language
  const raritiesList = useMemo(() => {
    if (rarities === null || rarities.length === 0) {
      return null;
    }
    return (
      <Aul className="adminRarities__rarity-list" noPoints>
        {rarities.map(({ rarity }) => (
          <Ali
            className={classTrim(`
              adminRarities__rarity-list__elt
            `)}
            key={rarity._id}
          >
            <Atitle level={3}>{rarity.title}</Atitle>
            <Button href={`/admin/rarity/${rarity._id}`}>
              {t('adminRarities.editRarity', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [rarities, t]);

  return (
    <div className="adminRarities">
      <Atitle level={1}>{t('adminRarities.title', { ns: 'pages' })}</Atitle>
      <div className="adminRarities__content">
        <div className="adminRarities__books">
          <Atitle level={2}>{t('adminRarities.list', { ns: 'pages' })}</Atitle>
          <div className="adminRarities__books__list">{raritiesList}</div>
          <Button href="/admin/rarity/new">{t('adminNewRarity.title', { ns: 'pages' })}</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminRarities;
