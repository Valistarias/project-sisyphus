import React, { useEffect, useRef, useState, type FC } from 'react';

import { useParams } from 'react-router-dom';

import { useApi, useCampaignEventWindow, useGlobalVars } from '../../../providers';

import {
  CampaignEventTab,
  CharacterBoard,
  CharacterCards,
  CharacterHeader,
  CharacterSkills,
  CharacterStats,
  CharacterVows,
} from '../../../organisms';
import { ErrorPage } from '../../index';
// import { calculateDices, diceResultToStr, type DiceResult } from '../../utils';

import './character.scss';
import type { TypeCampaignEvent } from '../../../types';

import { classTrim, type DiceRequest } from '../../../utils';

const Character: FC = () => {
  const { character, setCharacterFromId } = useGlobalVars();
  const { api } = useApi();
  const { id } = useParams();
  const { setToRoll } = useCampaignEventWindow();

  const [eventTabOpen, setEventTabOpen] = useState(false);

  const calledApi = useRef(false);

  useEffect(() => {
    if (!calledApi.current && id !== undefined) {
      if (character === false || character === null || character._id !== id) {
        setCharacterFromId(id);
      }

      calledApi.current = true;
    }
  }, [api, id, setCharacterFromId, character]);

  if (character === false) {
    return <ErrorPage />;
  }

  return (
    <div
      className={classTrim(`
        character
        ${character?.campaign === undefined ? 'character--no-campaign' : ''}
      `)}
    >
      <CampaignEventTab
        campaignId={character?.campaign?._id}
        character={character ?? undefined}
        onRollDices={(dices) => {
          setToRoll(dices, 'free');
        }}
        onClose={() => {
          setEventTabOpen(false);
        }}
        isTabOpen={eventTabOpen}
      />
      <div className="character__body">
        <div className="character__body__left">
          {character?.campaign !== undefined ? <CharacterCards /> : null}

          <CharacterBoard
            onRollDices={(dices: DiceRequest[], id: TypeCampaignEvent) => {
              setToRoll(dices, id);
            }}
          />
        </div>
        <div className="character__body__center">
          <CharacterHeader
            onOpenTab={() => {
              setEventTabOpen((prev) => !prev);
            }}
          />
          <CharacterStats
            onRollDices={(dices: DiceRequest[], id: TypeCampaignEvent) => {
              setToRoll(dices, id);
            }}
          />
        </div>
        <div className="character__body__right">
          <CharacterSkills
            onRollDices={(dices: DiceRequest[], id: TypeCampaignEvent) => {
              setToRoll(dices, id);
            }}
          />
          <CharacterVows />
        </div>
      </div>
    </div>
  );
};

export default Character;
