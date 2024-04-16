import React, { useEffect, useRef, type FC } from 'react';

import { useParams } from 'react-router-dom';

import { useApi, useGlobalVars, useRollWindow } from '../../providers';

import { Atitle } from '../../atoms';
import { RollTab } from '../../organisms';
import { ErrorPage } from '../index';

// import { calculateDices, diceResultToStr, type DiceResult } from '../../utils';

import './character.scss';

const Character: FC = () => {
  const { character, setCharacter, resetCharacter, loading } = useGlobalVars();
  const { api } = useApi();
  const { id } = useParams();
  const { setToRoll } = useRollWindow();

  const calledApi = useRef(false);

  useEffect(() => {
    if (setCharacter !== undefined && !calledApi.current && id !== undefined) {
      setCharacter(id);
      calledApi.current = true;
    }

    return () => {
      resetCharacter();
    };
  }, [api, id, setCharacter, resetCharacter]);

  if (loading || character === null) {
    return null;
  }

  if (character === false) {
    return <ErrorPage />;
  }

  return (
    <div className="character">
      <Atitle level={1}>{character.name}</Atitle>
      <RollTab
        campaignId={character.campaign?._id}
        character={character}
        onRollDices={(dices) => {
          setToRoll(dices, 'free');
        }}
      />
    </div>
  );
};

export default Character;
