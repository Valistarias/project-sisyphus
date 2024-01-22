import React, { useEffect, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../providers';

import { Ap, Atitle } from '../../atoms';
import { Alert } from '../../organisms';
import { ErrorPage } from '../index';

import { type ICampaign } from '../../types/data';

import './campaign.scss';

const Campaign: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { id } = useParams();

  const [campaign, setCampaign] = useState<ICampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const calledApi = useRef(false);

  useEffect(() => {
    if (api !== undefined && !calledApi.current && id !== undefined) {
      setLoading(true);
      calledApi.current = true;
      api.campaigns
        .get({
          campaignId: id,
        })
        .then((sentCampaign: ICampaign) => {
          setLoading(false);
          if (sentCampaign === undefined) {
            setNotFound(true);
          } else {
            setCampaign(sentCampaign);
          }
        })
        .catch((res) => {
          setLoading(false);
          if (res.response.status === 404) {
            setNotFound(true);
          } else {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('serverErrors.CYPU-301')}</Ap>
                </Alert>
              ),
            });
          }
        });
    }
  }, [api, createAlert, getNewId, t, id]);

  if (loading) {
    return null;
  }

  if (notFound || campaign === null) {
    return <ErrorPage />;
  }

  return (
    <div className="campaign">
      <Atitle level={1}>{campaign.name}</Atitle>
      <div className="campaign__link">
        <Ap>{`${window.location.origin}/campaign/join/${campaign.code}`}</Ap>
        <Ap>{t('campaign.inviteDetails', { ns: 'pages' })}</Ap>
      </div>
    </div>
  );
};

export default Campaign;
