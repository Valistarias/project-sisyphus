import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Ap, Atitle } from '../../../atoms';
import { Button } from '../../../molecules';
import { Alert } from '../../../organisms';
import { type ICampaign } from '../../../types';
import { ErrorPage } from '../../index';

import './joinCampaign.scss';

const JoinCampaign: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { id } = useParams();
  const { user } = useGlobalVars();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState<ICampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const calledApi = useRef(false);

  const onJoinCampaign = useCallback(() => {
    if (api !== undefined && id !== undefined) {
      setLoading(true);
      calledApi.current = true;
      api.campaigns
        .register({
          campaignCode: id,
        })
        .then(({ campaignId }) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('joinCampaign.successJoin', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          navigate(`/campaign/${campaignId}`);
        })
        .catch((res) => {
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
  }, [api, id, getNewId, createAlert, t, navigate]);

  const messageDom = useMemo(() => {
    if (campaign === null || user === null) {
      return null;
    }
    if (user._id === campaign.owner._id) {
      return (
        <>
          <Ap>{t('joinCampaign.alreadyOwner', { ns: 'pages' })}</Ap>
          <Button href={`/campaign/${campaign._id}`}>
            {t('joinCampaign.openCTA', { ns: 'pages' })}
          </Button>
        </>
      );
    }
    if (campaign.players?.find((player) => player._id === user._id) !== undefined) {
      return (
        <>
          <Ap>{t('joinCampaign.alreadyPlayer', { ns: 'pages' })}</Ap>
          <Button href={`/campaign/${campaign._id}`}>
            {t('joinCampaign.openCTA', { ns: 'pages' })}
          </Button>
        </>
      );
    }
    return (
      <>
        <Ap>{t('joinCampaign.text', { ns: 'pages' })}</Ap>
        <Ap>{campaign.name}</Ap>
        <Button onClick={onJoinCampaign}>{t('joinCampaign.joinCTA', { ns: 'pages' })}</Button>
      </>
    );
  }, [campaign, onJoinCampaign, t, user]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current && id !== undefined) {
      setLoading(true);
      calledApi.current = true;
      api.campaigns
        .find({
          campaignCode: id,
        })
        .then((sentJoinCampaign: ICampaign) => {
          setLoading(false);
          if (sentJoinCampaign === undefined) {
            setNotFound(true);
          } else {
            setCampaign(sentJoinCampaign);
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
    <div className="campaign-join">
      <Atitle level={1}>{t('joinCampaign.title', { ns: 'pages' })}</Atitle>
      {messageDom}
    </div>
  );
};

export default JoinCampaign;
