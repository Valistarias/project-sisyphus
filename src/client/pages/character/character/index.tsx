import React, { useEffect, useRef, type FC } from 'react';

import { useParams } from 'react-router-dom';

import { useApi, useGlobalVars, useRollWindow } from '../../../providers';

import { CharacterHeader, RollTab } from '../../../organisms';
import { ErrorPage } from '../../index';

// import { calculateDices, diceResultToStr, type DiceResult } from '../../utils';

import './character.scss';

const Character: FC = () => {
  const { character, setCharacterFromId, resetCharacter, loading } = useGlobalVars();
  const { api } = useApi();
  const { id } = useParams();
  const { setToRoll } = useRollWindow();

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
      <RollTab
        campaignId={character?.campaign?._id}
        character={character ?? undefined}
        onRollDices={(dices) => {
          setToRoll(dices, 'free');
        }}
      />
      <CharacterHeader />
    </div>
  );
};

export default Character;
