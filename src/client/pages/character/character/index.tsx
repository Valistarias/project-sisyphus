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
} from '../../../organisms';
import { ErrorPage } from '../../index';
// import { calculateDices, diceResultToStr, type DiceResult } from '../../utils';

import './character.scss';
import type { TypeCampaignEvent } from '../../../types';

import type { DiceRequest } from '../../../utils';

const Character: FC = () => {
  const { character, setCharacterFromId, resetCharacter } = useGlobalVars();
  const { api } = useApi();
  const { id } = useParams();
  const { setToRoll } = useCampaignEventWindow();

  const [eventTabOpen, setEventTabOpen] = useState(false);

  const calledApi = useRef(false);

  useEffect(() => {
    if (!calledApi.current && id !== undefined) {
      setCharacterFromId(id);
      calledApi.current = true;
    }

    return () => {
      resetCharacter();
    };
  }, [api, id, setCharacterFromId, resetCharacter]);

  if (character === false) {
    return <ErrorPage />;
  }

  return (
    <div className="character">
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
          <CharacterCards />
          <CharacterBoard />
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
        </div>
      </div>

      {/* <CharacterHeader
        onClickEventTab={() => {
          setEventTabOpen((prev) => !prev);
        }}
        isEventTabOpen={eventTabOpen}
      />
      <div className="character__body">
        <div className="character__body__content">
          <CharacterSkills
            className="character__body__content__left"
            onRollDices={(dices: DiceRequest[], id: TypeCampaignEvent) => {
              setToRoll(dices, id);
            }}
          />
          <div className="character__body__content__right">
            <CharacterStatus
              onRollDices={(dices: DiceRequest[], id: TypeCampaignEvent) => {
                setToRoll(dices, id);
              }}
            />
            <CharacterBoard />
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Character;
