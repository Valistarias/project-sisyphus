import React, {
  useCallback, useMemo, type FC
} from 'react';

import { useTranslation } from 'react-i18next';

import {
  useApi, useConfirmMessage, useGlobalVars, useSystemAlerts
} from '../../../providers';

import {
  Ali, Ap, Atitle, Aul
} from '../../../atoms';
import { Button } from '../../../molecules';
import { Alert } from '../../../organisms';

import { classTrim } from '../../../utils';

import './campaigns.scss';

const Campaigns: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const {
    user, campaigns, reloadCampaigns
  } = useGlobalVars();
  const confMessageEvt = useConfirmMessage();

  const onDeleteCampaign = useCallback(
    (id: string, name: string) => {
      if (api === undefined || confMessageEvt === null) {
        return;
      }
      confMessageEvt.setConfirmContent(
        {
          title: t('campaigns.confirmDelete.title', { ns: 'pages' }),
          text: t('campaigns.confirmDelete.text', {
            ns: 'pages', elt: name
          }),
          confirmCta: t('campaigns.confirmDelete.confirmCta', { ns: 'pages' }),
          theme: 'error'
        },
        (evtId: string) => {
          const confirmDelete = ({ detail }): void => {
            if (detail.proceed === true) {
              api.campaigns
                .delete({ id })
                .then(() => {
                  const newId = getNewId();
                  createAlert({
                    key: newId,
                    dom: (
                      <Alert key={newId} id={newId} timer={5}>
                        <Ap>{t('campaigns.successDelete', { ns: 'pages' })}</Ap>
                      </Alert>
                    )
                  });
                  reloadCampaigns();
                })
                .catch(({ response }) => {
                  const newId = getNewId();
                  createAlert({
                    key: newId,
                    dom: (
                      <Alert key={newId} id={newId} timer={5}>
                        <Ap>{t('serverErrors.CYPU-301')}</Ap>
                      </Alert>
                    )
                  });
                });
            }
            confMessageEvt.removeConfirmEventListener(evtId, confirmDelete);
          };
          confMessageEvt.addConfirmEventListener(evtId, confirmDelete);
        }
      );
    },
    [
      api,
      confMessageEvt,
      t,
      getNewId,
      createAlert,
      reloadCampaigns
    ]
  );

  const campaignList = useMemo(() => {
    if (campaigns.length === 0) {
      return null;
    }
    const campaignList: JSX.Element[] = [];
    campaigns.forEach((campaign) => {
      const isOwner = campaign.owner._id === user?._id;
      campaignList.push(
        <Ali
          className={classTrim(`
          campaigns__campaign-list__elt
        `)}
          key={campaign._id}
        >
          <Atitle className="campaigns__campaign-list__elt__title" level={3}>
            {campaign.name}
          </Atitle>
          <Ap className="campaigns__campaign-list__elt__owner">
            {`${t('terms.general.gm')}: ${
              isOwner ? t('terms.general.you') : campaign.owner.username
            }`}
          </Ap>
          <Ap className="campaigns__campaign-list__elt__players">
            {`${t('terms.general.player', { count: campaign.players.length })}: ${campaign.players.length}`}
          </Ap>
          <div className="campaigns__campaign-list__elt__buttons">
            <Button href={`/campaign/${campaign._id}`}>
              {t('campaigns.openCampaign', { ns: 'pages' })}
            </Button>
            {isOwner
              ? (
                  <Button
                    theme="text-only"
                    color="error"
                    onClick={() => {
                      onDeleteCampaign(campaign._id, campaign.name);
                    }}
                  >
                    {t('campaigns.deleteCampaign', { ns: 'pages' })}
                  </Button>
                )
              : null}
          </div>
        </Ali>
      );
    });

    return (
      <Aul className="campaigns__campaign-list" noPoints>
        {campaignList}
      </Aul>
    );
  }, [
    campaigns,
    onDeleteCampaign,
    t,
    user?._id
  ]);

  return (
    <div className="campaigns">
      <div className="campaigns__header">
        <Atitle level={1}>{t('campaigns.title', { ns: 'pages' })}</Atitle>
        <Button href="/campaign/new">{t('campaigns.create', { ns: 'pages' })}</Button>
      </div>
      {campaignList}
    </div>
  );
};

export default Campaigns;
