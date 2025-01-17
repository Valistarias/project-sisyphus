import React, {
  useCallback, useMemo, useState, type FC
} from 'react';

import { useTranslation } from 'react-i18next';

import {
  useApi, useGlobalVars, useSystemAlerts
} from '../../../providers';

import {
  Ap, Atitle
} from '../../../atoms';
import { Button } from '../../../molecules';
import {
  Alert, DragList, type IDragElt
} from '../../../organisms';

import type { ErrorResponseType } from '../../../types';

import { arraysEqual } from '../../../utils';

import './adminRarities.scss';

const AdminRarities: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const { rarities } = useGlobalVars();

  const [initialOrder, setInitialOrder] = useState<string[]>([]);
  const [raritiesOrder, setRaritiesOrder] = useState<string[]>([]);

  // TODO: Handle i18n in place of basic english language
  const rarityDragData = useMemo(() => {
    if (rarities.length === 0) {
      return {};
    }

    const raritiesDrag: Record<string, IDragElt> = {};
    rarities.forEach(({ rarity }) => {
      raritiesDrag[rarity._id] = {
        id: rarity._id,
        title: rarity.title,
        titleLevel: 3,
        button: {
          href: `/admin/rarity/${rarity._id}`,
          content: t('adminRarities.editRarity', { ns: 'pages' })
        }
      };
    });

    return raritiesDrag;
  }, [rarities, t]);

  // TODO: Handle i18n in place of basic english language
  // const raritiesList = useMemo(() => {
  //   if (rarities === null || rarities.length === 0) {
  //     return null;
  //   }
  //   return (
  //     <Aul className="adminRarities__rarity-list" noPoints>
  //       {rarities.map(({ rarity }) => (
  //         <Ali
  //           className={classTrim(`
  //             adminRarities__rarity-list__elt
  //           `)}
  //           key={rarity._id}
  //         >
  //           <Atitle level={3}>{rarity.title}</Atitle>
  //           <Button href={`/admin/rarity/${rarity._id}`}>
  //             {t('adminRarities.editRarity', { ns: 'pages' })}
  //           </Button>
  //         </Ali>
  //       ))}
  //     </Aul>
  //   );
  // }, [rarities, t]);

  const onRarityOrder = useCallback((elt: string[], isInitial: boolean) => {
    setRaritiesOrder(elt);
    if (isInitial) {
      setInitialOrder(elt);
    }
  }, []);

  const onUpdateOrder = useCallback(() => {
    if (arraysEqual(raritiesOrder, initialOrder) || api === undefined) {
      return;
    }

    api.rarities
      .changeRaritiesOrder({ order: raritiesOrder.map((chapter, index) => ({
        id: chapter,
        position: index
      })) })
      .then(() => {
        const newId = getNewId();
        createAlert({
          key: newId,
          dom: (
            <Alert key={newId} id={newId} timer={5}>
              <Ap>{t('adminEditRuleBook.successUpdate', { ns: 'pages' })}</Ap>
            </Alert>
          )
        });
        setInitialOrder(raritiesOrder);
      })
      .catch(({ response }: ErrorResponseType) => {
        console.error(response);
      });
  }, [
    raritiesOrder,
    initialOrder,
    api,
    getNewId,
    createAlert,
    t
  ]);

  return (
    <div className="adminRarities">
      <Atitle level={1}>{t('adminRarities.title', { ns: 'pages' })}</Atitle>
      <div className="adminRarities__content">
        <div className="adminRarities__rarities">
          <Atitle level={2}>{t('adminRarities.list', { ns: 'pages' })}</Atitle>
          {rarities.length !== 0
            ? (
                <Ap className="adminRarities__rarities__sub">
                  {t('adminRarities.listText', { ns: 'pages' })}
                </Ap>
              )
            : null}
          <div className="adminRarities__rarities__list">
            {/* {raritiesList} */}
            <DragList
              className="adminRarities__draglist"
              data={rarityDragData}
              id="main"
              onChange={onRarityOrder}
            />
          </div>
          <div className="adminRarities__rarities__btns">
            {rarities.length !== 0
              ? (
                  <Button onClick={onUpdateOrder}>
                    {t('adminRarities.updateOrder', { ns: 'pages' })}
                  </Button>
                )
              : null}
            <Button href="/admin/rarity/new">{t('adminNewRarity.title', { ns: 'pages' })}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRarities;
