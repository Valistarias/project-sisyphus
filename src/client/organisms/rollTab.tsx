import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useApi, useRollWindow, useSocket, useSystemAlerts } from '../providers';

import holoBackground from '../assets/imgs/tvbg2.gif';
import { Aicon, Ap, Avideo, type typeIcons } from '../atoms';
import { Button } from '../molecules';
import { type ICharacter, type IRoll, type TypeRoll } from '../types';

import Alert from './alert';
import RollResult from './rollResult';

import {
  calculateDices,
  classTrim,
  createBacisDiceRequest,
  diceResultToStr,
  type DiceRequest,
  type DiceResult,
} from '../utils';

import './rollTab.scss';

interface IRollTab {
  /** The campaign that the rolls are displayed */
  campaignId?: string;
  /** The character used for rolling */
  character: ICharacter;
  /** The ID used on the alert provider */
  onRollDices: (diceValues: DiceRequest[]) => void;
}

const RollTab: FC<IRollTab> = ({ onRollDices, campaignId, character }) => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { socket } = useSocket();
  const { addRollEventListener, removeRollEventListener } = useRollWindow();

  // const [loading, setLoading] = useState(true);
  const [isOpen, setOpen] = useState(false);
  // const [notFound, setNotFound] = useState(false);

  const [diceValues, setDiceValues] = useState<DiceRequest[]>(createBacisDiceRequest());
  const [dataPrevRolls, setDataPrevRolls] = useState<IRoll[]>([]);

  const canRoll = useMemo(() => diceValues.some(({ qty }) => qty > 0), [diceValues]);

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

  const addRoll = useCallback((roll: IRoll) => {
    setDataPrevRolls((prev) => {
      const next = [...prev];
      next.push(roll);
      return next;
    });
  }, []);

  const endRollEvent = useCallback(
    ({ detail }) => {
      if (
        api !== undefined &&
        detail.stats !== null &&
        campaignId !== undefined &&
        socket !== null
      ) {
        const { stats, mode }: { stats: DiceResult[]; mode: TypeRoll } = detail;
        const result = calculateDices(stats).total;
        api.rolls
          .create({
            result,
            formula: diceResultToStr(stats),
            character: character._id,
            campaign: campaignId,
            type: mode,
          })
          .then((data: IRoll) => {
            const dataRoll = {
              ...data,
              character,
            };
            socket.emit('newRoll', {
              room: campaignId,
              data: dataRoll,
            });
            addRoll(dataRoll);
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
    [addRoll, api, campaignId, character, createAlert, getNewId, socket, t]
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
                  roll-tab__dice__button
                  ${diceElt.qty > 0 ? 'roll-tab__dice__button--active' : ''}
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
                className="roll-tab__dice__button__icon"
                size="large"
              />
            </Button>
          );
        }
        return null;
      }),
    [changeDice, diceValues]
  );

  const logRolls = useMemo(() => {
    return dataPrevRolls.map(({ _id, character, createdAt, formula, result, type }) => {
      let authorName = '';
      if (character !== null) {
        authorName = `${character.firstName !== undefined ? `${character.firstName} ` : ''}${character.nickName !== undefined ? `"${character.nickName}" ` : ''}${character.lastName ?? ''}`;
      }
      return (
        <RollResult
          key={_id}
          authorName={authorName.trim()}
          result={result}
          formula={formula}
          type={type as TypeRoll}
          createdAt={new Date(createdAt)}
        />
      );
    });
  }, [dataPrevRolls]);

  const reloadRolls = useCallback(() => {
    if (api !== undefined && campaignId !== undefined) {
      api.rolls
        .getAllByCampaign({
          campaignId,
          offset: 0,
        })
        .then((sentRolls: IRoll[]) => {
          setDataPrevRolls(sentRolls);
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
  }, [api, campaignId, createAlert, getNewId, t]);

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
          api.rolls
            .getAllByCampaign({
              campaignId,
              offset: dataPrevRolls.length,
            })
            .then((sentRolls: IRoll[]) => {
              const indexedTotHeight = scrollRef.current?.scrollHeight;
              setDataPrevRolls((prev) => {
                const next = [...sentRolls, ...prev];
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
  }, [api, campaignId, createAlert, dataPrevRolls, getNewId, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current && scrollRef.current !== null) {
      calledApi.current = true;
      reloadRolls();
    }
  }, [api, createAlert, getNewId, t, reloadRolls]);

  useEffect(() => {
    if (calledApi.current) {
      calledApi.current = false;
    }
  }, [campaignId]);

  useEffect(() => {
    if (campaignId !== undefined && socket !== null) {
      const triggerNewData = (diceResult: IRoll): void => {
        addRoll(diceResult);
      };
      socket.emit('goToRoom', campaignId);
      socket.on('newRoll', triggerNewData);

      return () => {
        socket.off('newRoll', triggerNewData);
        socket.emit('exitRoom', campaignId);
      };
    }
  }, [addRoll, campaignId, socket]);

  useEffect(() => {
    if (!initEvt.current && api !== undefined) {
      initEvt.current = true;
      addRollEventListener?.('endroll', endRollEvent);
    }

    return () => {
      removeRollEventListener?.('endroll', endRollEvent);
    };
  }, [addRollEventListener, removeRollEventListener, api, endRollEvent]);

  setTimeout(function () {
    if (lockedScroll.current && scrollRef.current !== null) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, 0);

  return (
    <div
      className={classTrim(`
          roll-tab
          ${isOpen ? 'roll-tab--open' : ''}
        `)}
    >
      <div className="roll-tab__buttons">
        <Button
          theme="line"
          className="roll-tab__buttons__toggle"
          onClick={() => {
            if (isOpen) {
              setDiceValues(createBacisDiceRequest());
            }
            setOpen(!isOpen);
          }}
        >
          {isOpen
            ? t('rollTab.close', { ns: 'components' })
            : t('rollTab.dices', { ns: 'components' })}
        </Button>
      </div>
      <div className="roll-tab__content">
        <div className="roll-tab__log">
          <Ap className="roll-tab__log__title">{t('rollTab.title', { ns: 'components' })}</Ap>
          <div
            className="roll-tab__log__table"
            style={{ backgroundImage: `url(${holoBackground})` }}
            ref={scrollRef}
            onScroll={onLogScroll}
          >
            {campaignId === undefined ? (
              <p className="roll-tab__log__table__no-canmpaign">
                {t('rollTab.noCampaign', { ns: 'components' })}
              </p>
            ) : null}
            {logRolls}
          </div>
          <Avideo className="roll-tab__log__animatedbg" video="logo" />
        </div>
        <div className="roll-tab__dice">
          <Ap className="roll-tab__dice__title">{t('rollTab.freeRoll', { ns: 'components' })}</Ap>
          {diceElts}
          <Button
            theme="line"
            size="large"
            className="roll-tab__dice__roll"
            disabled={!canRoll}
            onClick={() => {
              onRollDices(diceValues);
              setDiceValues(createBacisDiceRequest());
            }}
          >
            {t('rollTab.roll', { ns: 'components' })}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RollTab;
