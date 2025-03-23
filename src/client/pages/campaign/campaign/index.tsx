import React, { useCallback, useEffect, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import {
  useApi,
  useConfirmMessage,
  useGlobalVars,
  useSoundSystem,
  useSystemAlerts,
} from '../../../providers';

import { Ap, Atitle } from '../../../atoms';
import { Button, CopyField, DeckDisplay } from '../../../molecules';
import { Alert } from '../../../organisms';
import { ErrorPage } from '../../index';

import type { ConfirmMessageDetailData } from '../../../providers/confirmMessage';
import type { ErrorResponseType, ICampaign } from '../../../types';

import './campaign.scss';

const Campaign: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { id } = useParams();
  const { user } = useGlobalVars();
  const { tone } = useSoundSystem();
  const { setConfirmContent, removeConfirmEventListener, addConfirmEventListener } =
    useConfirmMessage();

  const [campaign, setCampaign] = useState<ICampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const calledApi = useRef(false);

  const onShuffle = useCallback(() => {
    if (api === undefined || id === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('campaign.confirmShuffle.title', { ns: 'pages' }),
        text: t('campaign.confirmShuffle.text', { ns: 'pages' }),
        confirmCta: t('campaign.confirmShuffle.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }: { detail: ConfirmMessageDetailData }): void => {
          if (detail.proceed) {
            api.campaigns
              .shuffleDeck({ campaignId: id })
              .then(({ deck, discard }) => {
                setLoading(false);
                setCampaign((prevCampaign) => {
                  if (prevCampaign === null) {
                    return null;
                  }

                  return {
                    ...prevCampaign,
                    deck,
                    discard,
                  };
                });
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('campaign.successShuffle', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
              })
              .catch(({ response }: ErrorResponseType) => {
                setLoading(false);
                if (response.data.code === 'CYPU-104') {
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
          removeConfirmEventListener(evtId, confirmDelete);
        };
        addConfirmEventListener(evtId, confirmDelete);
      }
    );
  }, [
    addConfirmEventListener,
    api,
    createAlert,
    getNewId,
    id,
    removeConfirmEventListener,
    setConfirmContent,
    t,
  ]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current && id !== undefined) {
      setLoading(true);
      calledApi.current = true;
      api.campaigns
        .get({ campaignId: id })
        .then((sentCampaign) => {
          setLoading(false);
          setCampaign(sentCampaign);
        })
        .catch(({ response }: ErrorResponseType) => {
          setLoading(false);
          if (response.data.code === 'CYPU-104') {
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

  if (notFound || campaign === null || campaign.owner._id !== user?._id) {
    return <ErrorPage />;
  }

  return (
    <div className="campaign">
      <div className="campaign__main">
        <Atitle level={1}>{campaign.name}</Atitle>
        <div className="campaign__main__deck campaignBlock">
          <Atitle level={3}>{t('campaign.deck.title', { ns: 'pages' })}</Atitle>
          <Ap className="campaign__main__deck__details">
            {t('campaign.deck.details', { ns: 'pages' })}
          </Ap>
          <DeckDisplay campaign={campaign} onShuffle={onShuffle} />
        </div>
      </div>
      <div className="campaign__secondary">
        <div className="campaign__secondary__join campaignBlock">
          <Atitle level={3}>{t('campaign.invite.title', { ns: 'pages' })}</Atitle>
          <CopyField
            className="campaign__secondary__join__field"
            value={`${window.location.origin}/campaign/join/${campaign.code}`}
          />
          <Ap className="campaign__secondary__join__details">
            {t('campaign.invite.details', { ns: 'pages' })}
          </Ap>
          <Button onClick={tone}>Test Sound</Button>
        </div>
      </div>
    </div>
  );
};

export default Campaign;
