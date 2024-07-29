import React, { useEffect, useRef, type FC } from 'react';

import { useParams } from 'react-router-dom';

import { useApi, useCampaignEventWindow, useGlobalVars } from '../../../providers';

import { CampaignEventTab, CharacterHeader } from '../../../organisms';
import { CharacterSkills } from '../../../organisms/character';
import { type TypeCampaignEvent } from '../../../types';
import { ErrorPage } from '../../index';

// import { calculateDices, diceResultToStr, type DiceResult } from '../../utils';
import { type DiceRequest } from '../../../utils';

import './character.scss';

const Character: FC = () => {
  const { character, setCharacterFromId, resetCharacter } = useGlobalVars();
  const { api } = useApi();
  const { id } = useParams();
  const { setToRoll } = useCampaignEventWindow();

  const calledApi = useRef(false);

  useEffect(() => {
    if (setCharacterFromId !== undefined && !calledApi.current && id !== undefined) {
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
      />
      <CharacterHeader />
      <div className="character__body">
        <div className="character__body__content">
          <CharacterSkills
            className="character__body__content__left"
            onRollDices={(dices: DiceRequest[], id: TypeCampaignEvent) => {
              setToRoll(dices, id);
            }}
          />
          <div className="character__body__content__right" />
        </div>
      </div>
    </div>
  );
};

export default Character;
