import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useApi, useCampaignEventWindow, useSocket, useSystemAlerts } from '../providers';

import holoBackground from '../assets/imgs/tvbg2.gif';
import { Aicon, Ap, Avideo, type typeIcons } from '../atoms';
import { Button } from '../molecules';
import { type ICampaignEvent, type ICharacter, type TypeCampaignEvent } from '../types';

import Alert from './alert';
import CampaignEventLine from './campaignEventLine';

import {
  calculateDices,
  classTrim,
  createBasicDiceRequest,
  diceResultToStr,
  type DiceRequest,
  type DiceResult,
} from '../utils';

import './campaignEventTab.scss';

interface ICampaignEventTab {
  /** The campaign that the rolls are displayed */
  campaignId?: string;
  /** The character used for rolling */
  character?: ICharacter;
  /** The ID used on the alert provider */
  onRollDices: (diceValues: DiceRequest[]) => void;
}

const CampaignEventTab: FC<ICampaignEventTab> = ({ onRollDices, campaignId, character }) => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { socket } = useSocket();
  const { addCampaignEventListener, removeCampaignEventListener } = useCampaignEventWindow();

  // const [loading, setLoading] = useState(true);
  const [isOpen, setOpen] = useState(false);
  // const [notFound, setNotFound] = useState(false);

  const [diceValues, setDiceValues] = useState<DiceRequest[]>(createBasicDiceRequest());
  const [dataPrevCampaignEvents, setDataPrevCampaignEvents] = useState<ICampaignEvent[]>([]);

  const canCampaignEvent = useMemo(() => diceValues.some(({ qty }) => qty > 0), [diceValues]);

  const calledApi = useRef(false);
  const initEvt = useRef(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lockedScroll = useRef(true);

  const changeDice = useCallback((dice: number, type: 'add' | 'remove') => {
    setDiceValues((prevDiceValues: DiceRequest[]) => {
      const newDiceValues = prevDiceValues.map((diceObj) => {
        if (diceObj.type === dice) {
          if (type === 'remove' && diceObj.qty > 0) {
            return {
              ...diceObj,
              qty: diceObj.qty - 1,
            };
          } else if (type === 'add') {
            return {
              ...diceObj,
              qty: diceObj.qty + 1,
            };
          }
        }
        return diceObj;
      });
      return newDiceValues;
    });
  }, []);

  const addCampaignEvent = useCallback((roll: ICampaignEvent) => {
    setDataPrevCampaignEvents((prev) => {
      const next = [...prev];
      next.push(roll);
      return next;
    });
  }, []);

  const endRollEvent = useCallback(
    ({
      detail,
    }: CustomEvent<{
      stats: DiceResult[];
      mode: TypeCampaignEvent;
    }>) => {
      if (
        api !== undefined &&
        detail.stats !== null &&
        campaignId !== undefined &&
        character !== undefined &&
        socket !== null
      ) {
        const { stats, mode } = detail;
        const result = calculateDices(stats).total;
        api.campaignEvents
          .create({
            result,
            formula: diceResultToStr(stats),
            character: character._id,
            campaign: campaignId,
            type: mode,
          })
          .then((data: ICampaignEvent) => {
            const dataCampaignEvent = {
              ...data,
              character,
            };
            socket.emit('newCampaignEvent', {
              room: campaignId,
              data: dataCampaignEvent,
            });
            addCampaignEvent(dataCampaignEvent);
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
    },
    [addCampaignEvent, api, campaignId, character, createAlert, getNewId, socket, t]
  );

  const diceElts = useMemo(
    () =>
      diceValues.map(({ type: typeDiceNumber }) => {
        const diceElt = diceValues.find((diceValue) => diceValue.type === typeDiceNumber);
        if (diceElt != null) {
          return (
            <Button
              key={typeDiceNumber}
              theme="solid"
              className={classTrim(`
                  campaign-event-tab__dice__button
                  ${diceElt.qty > 0 ? 'campaign-event-tab__dice__button--active' : ''}
                `)}
              size="large"
              onContextMenu={(e) => {
                e.preventDefault();
                changeDice(typeDiceNumber, 'remove');
              }}
              onClick={(e) => {
                e.preventDefault();
                changeDice(typeDiceNumber, 'add');
              }}
              active={diceElt.qty > 0}
            >
              <Ap>{`${diceElt.qty > 0 ? diceElt.qty : ''}D${typeDiceNumber}`}</Ap>
              <Aicon
                type={`d${typeDiceNumber}` as typeIcons}
                className="campaign-event-tab__dice__button__icon"
                size="large"
              />
            </Button>
          );
        }
        return null;
      }),
    [changeDice, diceValues]
  );

  const logCampaignEvents = useMemo(() => {
    return dataPrevCampaignEvents.map(({ _id, character, createdAt, formula, result, type }) => {
      let authorName = '';
      if (character !== null) {
        authorName = `${character.firstName !== undefined ? `${character.firstName} ` : ''}${character.nickName !== undefined ? `"${character.nickName}" ` : ''}${character.lastName ?? ''}`;
      }
      return (
        <CampaignEventLine
          key={_id}
          authorName={authorName.trim()}
          result={result}
          formula={formula}
          type={type as TypeCampaignEvent}
          createdAt={new Date(createdAt)}
        />
      );
    });
  }, [dataPrevCampaignEvents]);

  const reloadCampaignEvents = useCallback(
    (campaignId: string) => {
      if (api !== undefined) {
        api.campaignEvents
          .getAllByCampaign({
            campaignId,
            offset: 0,
          })
          .then((sentCampaignEvents: ICampaignEvent[]) => {
            setDataPrevCampaignEvents(sentCampaignEvents);
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
    },
    [api, createAlert, getNewId, t]
  );

  const onLogScroll = useCallback(() => {
    if (scrollRef.current !== null) {
      const totalHeight = scrollRef.current.scrollTop + scrollRef.current.clientHeight;
      if (totalHeight >= scrollRef.current.scrollHeight && !lockedScroll.current) {
        lockedScroll.current = true;
      } else if (totalHeight < scrollRef.current.scrollHeight && lockedScroll.current) {
        lockedScroll.current = false;
      }

      if (scrollRef.current.scrollTop === 0) {
        if (api !== undefined && campaignId !== undefined) {
          api.campaignEvents
            .getAllByCampaign({
              campaignId,
              offset: dataPrevCampaignEvents.length,
            })
            .then((sentCampaignEvents: ICampaignEvent[]) => {
              const indexedTotHeight = scrollRef.current?.scrollHeight;
              setDataPrevCampaignEvents((prev) => {
                const next = [...sentCampaignEvents, ...prev];
                return next;
              });
              setTimeout(function () {
                if (scrollRef.current !== null && indexedTotHeight !== undefined) {
                  scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight - indexedTotHeight);
                }
              }, 0);
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
      }
    }
  }, [api, campaignId, createAlert, dataPrevCampaignEvents, getNewId, t]);

  useEffect(() => {
    if (
      api !== undefined &&
      !calledApi.current &&
      scrollRef.current !== null &&
      campaignId !== undefined
    ) {
      calledApi.current = true;
      reloadCampaignEvents(campaignId);
    }
  }, [api, createAlert, getNewId, t, reloadCampaignEvents, campaignId]);

  useEffect(() => {
    if (calledApi.current) {
      calledApi.current = false;
    }
  }, [campaignId]);

  useEffect(() => {
    if (campaignId !== undefined && socket !== null) {
      const triggerNewData = (diceResult: ICampaignEvent): void => {
        addCampaignEvent(diceResult);
      };
      socket.emit('goToRoom', campaignId);
      socket.on('newCampaignEvent', triggerNewData);

      return () => {
        socket.off('newCampaignEvent', triggerNewData);
        socket.emit('exitRoom', campaignId);
      };
    }
  }, [addCampaignEvent, campaignId, socket]);

  useEffect(() => {
    if (
      !initEvt.current &&
      api !== undefined &&
      socket !== null &&
      campaignId !== undefined &&
      character !== undefined
    ) {
      initEvt.current = true;
      addCampaignEventListener?.('endroll', endRollEvent);
    }

    return () => {
      removeCampaignEventListener?.('endroll', endRollEvent);
    };
  }, [
    addCampaignEventListener,
    removeCampaignEventListener,
    api,
    endRollEvent,
    socket,
    campaignId,
    character,
  ]);

  setTimeout(function () {
    if (lockedScroll.current && scrollRef.current !== null) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, 0);

  return (
    <div
      className={classTrim(`
          campaign-event-tab
          ${isOpen ? 'campaign-event-tab--open' : ''}
        `)}
    >
      <div className="campaign-event-tab__buttons">
        <Button
          theme="line"
          className="campaign-event-tab__buttons__toggle"
          onClick={() => {
            if (isOpen) {
              setDiceValues(createBasicDiceRequest());
            }
            setOpen(!isOpen);
          }}
        >
          {isOpen
            ? t('campaignEventTab.close', { ns: 'components' })
            : t('campaignEventTab.open', { ns: 'components' })}
        </Button>
      </div>
      <div className="campaign-event-tab__content">
        <div className="campaign-event-tab__log">
          <Ap className="campaign-event-tab__log__title">
            {t('campaignEventTab.title', { ns: 'components' })}
          </Ap>
          <div
            className="campaign-event-tab__log__table"
            style={{ backgroundImage: `url(${holoBackground})` }}
            ref={scrollRef}
            onScroll={onLogScroll}
          >
            {campaignId === undefined ? (
              <p className="campaign-event-tab__log__table__no-canmpaign">
                {t('campaignEventTab.noCampaign', { ns: 'components' })}
              </p>
            ) : null}
            {logCampaignEvents}
          </div>
          <Avideo className="campaign-event-tab__log__animatedbg" video="logo" />
        </div>
        <div className="campaign-event-tab__dice">
          <Ap className="campaign-event-tab__dice__title">
            {t('campaignEventTab.freeRoll', { ns: 'components' })}
          </Ap>
          {diceElts}
          <Button
            theme="line"
            size="large"
            className="campaign-event-tab__dice__roll"
            disabled={!canCampaignEvent}
            onClick={() => {
              onRollDices(diceValues);
              setDiceValues(createBasicDiceRequest());
            }}
          >
            {t('campaignEventTab.roll', { ns: 'components' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignEventTab;
