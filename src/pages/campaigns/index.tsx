import React, { useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useApi, useGlobalVars, useSystemAlerts } from '../../providers';

import { Ali, Ap, Atitle, Aul } from '../../atoms';
import { Button } from '../../molecules';
import { Alert } from '../../organisms';

import { type ICampaign } from '../../interfaces';

import { classTrim } from '../../utils';

import './campaigns.scss';

const Campaigns: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { user } = useGlobalVars();

  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const calledApi = useRef(false);

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
          <Ap className="campaigns__campaign-list__elt__owner">{`${t('terms.general.gm')}: ${
            isOwner ? t('terms.general.you') : campaign.owner.username
          }`}</Ap>
          <Ap className="campaigns__campaign-list__elt__players">{`${t('terms.general.player', {
            count: campaign.players.length,
          })}: ${campaign.players.length}`}</Ap>
          <Button href={`/campaign/${campaign._id}`}>
            {t('campaigns.openCampaign', { ns: 'pages' })}
          </Button>
        </Ali>
      );
    });

    return (
      <Aul className="campaigns__campaign-list" noPoints>
        {campaignList}
      </Aul>
    );
  }, [campaigns, t, user]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
      api.campaigns
        .getAll()
        .then((sentCampaigns: ICampaign[]) => {
          setLoading(false);
          setCampaigns(sentCampaigns);
        })
        .catch(() => {
          setLoading(false);
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            ),
          });
        });
    }
  }, [api, createAlert, getNewId, t]);

  // TODO: Add loading state
  if (loading) {
    return null;
  }

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
