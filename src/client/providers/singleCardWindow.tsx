import React, { useCallback, useContext, useMemo, useState, type FC, type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { Ap, Atitle } from '../atoms';
import { Button, Card } from '../molecules';
import { Alert, RichTextElement } from '../organisms';

import { useApi } from './api';
import { useCampaignEventWindow } from './campaignEventWindow';
import { useGlobalVars } from './globalVars';
import { useSystemAlerts } from './systemAlerts';

import type { ErrorResponseType, IBasicArcaneCard, ICharacter, ICuratedArcane } from '../types';

import { classTrim, romanize } from '../utils';

import './singleCardWindow.scss';

interface ISingleCardWindowContext {
  /** The function to select an arcane */
  selectCard: (card: IBasicArcaneCard) => void;
}

interface SingleCardWindowProviderProps {
  /** The childrens of the Providers element */
  children: ReactNode;
}

const SingleCardWindowContext = React.createContext<ISingleCardWindowContext>(
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- To avoid null values
  {} as ISingleCardWindowContext
);

export const SingleCardWindowProvider: FC<SingleCardWindowProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const { character, setCharacter, arcanes } = useGlobalVars();
  const { api } = useApi();
  const { dispatchCampaignEvent } = useCampaignEventWindow();
  const { createAlert, getNewId } = useSystemAlerts();

  const [loading, setLoading] = useState<boolean>(false);
  const [isWindowOpened, setWindowOpened] = useState<boolean>(false);

  const [selectedCard, setSelectedCard] = useState<ICuratedArcane | null>(null);

  const selectCard = useCallback(
    (sentArcane: IBasicArcaneCard) => {
      const foundCard = arcanes.find((arcane) => arcane.arcane._id === sentArcane._id);
      if (foundCard !== undefined) {
        setSelectedCard(foundCard);
        setWindowOpened(true);
      }
    },
    [arcanes]
  );

  const closeWindow = useCallback(() => {
    setWindowOpened(false);
  }, []);

  const onUseArcane = useCallback(() => {
    if (
      selectedCard !== null &&
      api !== undefined &&
      character !== false &&
      character?.campaign !== undefined
    ) {
      setLoading(true);
      api.campaigns
        .discardCards({
          campaignId: character.campaign._id,
          characterId: character._id,
          cards: [{ _id: selectedCard.arcane._id }],
        })
        .then((newHand) => {
          setLoading(false);
          closeWindow();
          setCharacter((prev: ICharacter) => {
            const next = { ...prev };
            next.hand = newHand;

            return next;
          });

          dispatchCampaignEvent({ result: 0, mode: `card-${selectedCard.arcane._id}` });
        })
        .catch(({ response }: ErrorResponseType) => {
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
  }, [
    selectedCard,
    api,
    character,
    closeWindow,
    setCharacter,
    dispatchCampaignEvent,
    getNewId,
    createAlert,
    t,
  ]);

  const providerValues = useMemo<ISingleCardWindowContext>(
    () => ({
      selectCard,
    }),
    [selectCard]
  );

  return (
    <SingleCardWindowContext.Provider value={providerValues}>
      <div
        className={classTrim(`
          single-card-window
          ${isWindowOpened ? 'single-card-window--open' : ''}
        `)}
      >
        <div
          className="single-card-window__shadow"
          // onClick={closeWindow}
        />
        <div className="single-card-window__window">
          {selectedCard !== null ? (
            <div className="single-card-window__window__block">
              <Card size="large" card={{ _id: selectedCard.arcane._id }} flipped />
              <div className="single-card-detail">
                <Atitle className="single-card-detail__title" level={3}>
                  <span className="single-card-detail__title__number">
                    {romanize(selectedCard.arcane.number)}
                  </span>
                  <span className="single-card-detail__title__text">{` - ${selectedCard.arcane.title}`}</span>
                </Atitle>
                <RichTextElement
                  className="single-card-detail__text"
                  rawStringContent={selectedCard.arcane.summary}
                  readOnly
                />
                <div className="single-card-detail__buttons">
                  <Button onClick={onUseArcane} disabled={loading}>
                    {t('cardWindow.use', { ns: 'components' })}
                  </Button>
                  <Button onClick={closeWindow} theme="text-only" disabled={loading}>
                    {t('cardWindow.cancel', { ns: 'components' })}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {children}
    </SingleCardWindowContext.Provider>
  );
};

export const useSingleCardWindow = (): ISingleCardWindowContext =>
  useContext(SingleCardWindowContext);
