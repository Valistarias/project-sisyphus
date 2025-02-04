import React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useApi, useCampaignEventWindow, useSocket, useSystemAlerts } from '../providers';

import holoBackground from '../assets/imgs/tvbg2.gif';
import { Aicon, Ap, Avideo, type typeIcons } from '../atoms';
import { Button } from '../molecules';

import Alert from './alert';
import CampaignEventLine from './campaignEventLine';

import type { CampaignEventDetailData } from '../providers/campaignEventWindow';
import type { ICampaignEvent, ICharacter } from '../types';

import { classTrim, createBasicDiceRequest, type DiceRequest } from '../utils';

import './campaignEventTab.scss';

interface ICampaignEventTab {
  /** The campaign that the rolls are displayed */
  campaignId?: string;
  /** The character used for rolling */
  character?: ICharacter;
  /** The function sent to roll the dices */
  onRollDices: (diceValues: DiceRequest[]) => void;
  /** Is the tab open ? */
  isTabOpen: boolean;
  /** When the close button is clicked */
  onClose: (e: React.MouseEvent<HTMLElement>) => void;
}

const CampaignEventTab: FC<ICampaignEventTab> = ({
  isTabOpen,
  onRollDices,
  campaignId,
  character,
  onClose,
}) => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { socket } = useSocket();
  const campaignEvt = useCampaignEventWindow();

  // const [loading, setLoading] = useState(true);
  // const [isOpen, setOpen] = useState(false);
  // const [notFound, setNotFound] = useState(false);

  const [diceValues, setDiceValues] = useState<DiceRequest[]>(createBasicDiceRequest());
  const [dataPrevCampaignEvents, setDataPrevCampaignEvents] = useState<ICampaignEvent[]>([]);

  const canCampaignEvent = useMemo(() => diceValues.some(({ qty }) => qty > 0), [diceValues]);

  const calledApi = useRef(false);
  const initEvt = useRef(false);
  const socketEvt = useRef(false);
  const unMountEvt = useRef(false);
  // For event reload
  const charRef = useRef(character);

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

  const addCampaignEventToTab = useCallback((roll: ICampaignEvent) => {
    setDataPrevCampaignEvents((prev) => {
      const next = [...prev];
      next.push(roll);

      return next;
    });
  }, []);

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
                type={`D${typeDiceNumber}` as typeIcons}
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

  const logCampaignEvents = useMemo(
    () =>
      dataPrevCampaignEvents.map(({ _id, character, createdAt, formula, result, type }) => {
        const authorName = `${character.firstName !== undefined ? `${character.firstName} ` : ''}${character.nickName !== undefined ? `"${character.nickName}" ` : ''}${character.lastName ?? ''}`;

        return (
          <CampaignEventLine
            key={_id}
            authorName={authorName.trim()}
            result={result}
            formula={formula}
            type={type}
            createdAt={new Date(createdAt)}
          />
        );
      }),
    [dataPrevCampaignEvents]
  );

  const reloadCampaignEvents = useCallback(
    (campaignId: string) => {
      if (api !== undefined) {
        api.campaignEvents
          .getAllByCampaign({
            campaignId,
            offset: 0,
          })
          .then((sentCampaignEvents) => {
            setDataPrevCampaignEvents(sentCampaignEvents);
          })
          .catch(() => {
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
            .then((sentCampaignEvents) => {
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
            .catch(() => {
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
    calledApi.current &&= false;
  }, [campaignId]);

  useEffect(() => {
    charRef.current = character;
  }, [character]);

  useEffect(() => {
    unMountEvt.current = false;

    return () => {
      unMountEvt.current = true;
    };
  }, []);

  useEffect(() => {
    const triggerNewData = (diceResult: ICampaignEvent): void => {
      addCampaignEventToTab(diceResult);
    };

    if (campaignId !== undefined && socket !== null && !socketEvt.current) {
      socketEvt.current = true;
      socket.emit('goToRoom', campaignId);
      socket.on('newCampaignEvent', triggerNewData);
    }

    return () => {
      if (unMountEvt.current && socket !== null) {
        socket.off('newCampaignEvent', triggerNewData);
        socket.emit('exitRoom', campaignId);
      }
    };
  }, [addCampaignEventToTab, campaignId, socket]);

  useEffect(() => {
    const addCampaignEvent = ({ detail }: { detail?: CampaignEventDetailData }): void => {
      if (
        api !== undefined &&
        detail !== undefined &&
        campaignId !== undefined &&
        charRef.current !== undefined &&
        socket !== null
      ) {
        const { result, formula, mode } = detail;
        api.campaignEvents
          .create({
            result,
            formula,
            character: charRef.current._id,
            campaign: campaignId,
            type: mode,
          })
          .then((data) => {
            if (charRef.current !== undefined) {
              const dataCampaignEvent = {
                ...data,
                character: charRef.current,
              };
              socket.emit('newCampaignEvent', {
                room: campaignId,
                data: dataCampaignEvent,
              });
              addCampaignEventToTab(dataCampaignEvent);
            }
          })
          .catch(() => {
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
    };

    if (!initEvt.current && api !== undefined && socket !== null && campaignId !== undefined) {
      initEvt.current = true;
      campaignEvt.addCampaignEventListener(addCampaignEvent);
    }

    return () => {
      if (unMountEvt.current) {
        campaignEvt.removeCampaignEventListener(addCampaignEvent);
      }
    };
  }, [campaignEvt, addCampaignEventToTab, api, campaignId, createAlert, getNewId, socket, t]);

  useEffect(() => {
    if (isTabOpen) {
      setDiceValues(createBasicDiceRequest());
    }
  }, [isTabOpen]);

  setTimeout(function () {
    if (lockedScroll.current && scrollRef.current !== null) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, 0);

  return (
    <div
      className={classTrim(`
          campaign-event-tab
          ${isTabOpen ? 'campaign-event-tab--open' : ''}
        `)}
    >
      {/* <div className="campaign-event-tab__buttons">
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
          {isTabOpen
            ? t('campaignEventTab.close', { ns: 'components' })
            : t('campaignEventTab.open', { ns: 'components' })}
        </Button>
      </div> */}
      <div className="campaign-event-tab__content">
        <Button
          theme="text-only"
          className="campaign-event-tab__content__close"
          onClick={onClose}
          icon="Cross"
        />
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
