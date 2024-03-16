import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useApi, useSystemAlerts } from '../providers';

import holoBackground from '../assets/imgs/tvbg.gif';
import { Aicon, Ap, Avideo, type typeIcons } from '../atoms';
import { Button } from '../molecules';
import { type IRoll, type TypeRoll } from '../types/data';

import Alert from './alert';
import RollResult from './rollResult';

import { classTrim, createBacisDiceRequest, type DiceRequest } from '../utils';

import './rollTab.scss';

interface IRollTab {
  /** The campaign that the rolls are displayed */
  campaignId: string;
  /** The character used for rolling */
  characterId: string;
  /** The ID used on the alert provider */
  onRollDices: (diceValues: DiceRequest[]) => void;
}

const RollTab: FC<IRollTab> = ({ onRollDices, campaignId, characterId }) => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const [isOpen, setOpen] = useState(false);

  const [diceValues, setDiceValues] = useState<DiceRequest[]>(createBacisDiceRequest());
  const [dataPrevRolls, setDataPrevRolls] = useState<IRoll[]>([]);

  const canRoll = useMemo(() => diceValues.some(({ qty }) => qty > 0), [diceValues]);

  const calledApi = useRef(false);

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

  const diceElts = useMemo(
    () =>
      diceValues.map(({ type: typeDiceNumber }) => {
        const diceElt = diceValues.find((diceValue) => diceValue.type === typeDiceNumber);
        if (diceElt != null) {
          return (
            <Button
              key={typeDiceNumber}
              theme="solid"
              className="roll-tab__dice__button"
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
    return dataPrevRolls.map(({ _id, character, createdAt, formula, result, type }) => (
      <RollResult
        key={_id}
        authorName={character.name}
        result={result}
        formula={formula}
        type={type as TypeRoll}
        createdAt={new Date(createdAt)}
      />
    ));
  }, [dataPrevRolls]);

  const reloadRolls = useCallback(() => {
    if (api !== undefined) {
      api.rolls
        .getAllByCampaign({
          campaignId,
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

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      reloadRolls();
    }
  }, [api, createAlert, getNewId, t, reloadRolls]);

  useEffect(() => {
    if (calledApi.current) {
      calledApi.current = false;
    }
  }, [campaignId]);

  return (
    <div
      className={classTrim(`
          roll-tab
          ${isOpen ? 'roll-tab--open' : ''}
        `)}
    >
      <div className="roll-tab__buttons">
        <Button
          theme="solid"
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
          >
            {campaignId === undefined ? (
              <p className="roll-tab__log__table__no-canmpaign">
                {t('rollTab.noCampaign', { ns: 'components' })}
              </p>
            ) : null}
            <Avideo className="roll-tab__log__table__animatedbg" video="logo" />
            {logRolls}
          </div>
        </div>
        <div className="roll-tab__dice">
          <Ap className="roll-tab__dice__title">{t('rollTab.freeRoll', { ns: 'components' })}</Ap>
          {diceElts}
          <Button
            theme="text-only"
            size="large"
            active
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
