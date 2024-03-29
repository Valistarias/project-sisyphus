import React, { useEffect, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useApi, useRollWindow, useSocket, useSystemAlerts } from '../../providers';

import { Ap, Atitle } from '../../atoms';
import { Alert, RollTab } from '../../organisms';
import { type ICharacter } from '../../types';
import { ErrorPage } from '../index';

// import { calculateDices, diceResultToStr, type DiceResult } from '../../utils';

import './character.scss';

const Character: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { id } = useParams();
  const { socket } = useSocket();
  const { setToRoll } = useRollWindow();

  const [character, setCharacter] = useState<ICharacter | null>(null);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const calledApi = useRef(false);

  useEffect(() => {
    if (api !== undefined && !calledApi.current && id !== undefined && socket !== null) {
      setLoading(true);
      calledApi.current = true;
      api.characters
        .get({
          characterId: id,
        })
        .then((sentCharacter: ICharacter) => {
          setLoading(false);
          if (sentCharacter === undefined) {
            setNotFound(true);
          } else {
            setCharacter(sentCharacter);
          }
        })
        .catch((res) => {
          setLoading(false);
          if (res.response.status === 404) {
            setNotFound(true);
          } else {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('serverErrors.CYPU-301')}</Ap>
                </Alert>
              ),
            });
          }
        });
    }
  }, [api, createAlert, getNewId, t, id, socket]);

  if (loading) {
    return null;
  }

  if (notFound || character === null) {
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
