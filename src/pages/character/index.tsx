import React, { useCallback, useEffect, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../providers';

import { Aicon, Ap, Atitle } from '../../atoms';
import { Button } from '../../molecules';
import { Alert, RollTab } from '../../organisms';
import { ErrorPage } from '../index';

import { type ICharacter } from '../../interfaces';

import { throwDices } from '../../utils';

import './character.scss';

const Character: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { id } = useParams();

  const [character, setCharacter] = useState<ICharacter | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const calledApi = useRef(false);

  const testLaunchDice = useCallback(() => {
    console.log('launch dice');
    const throwDice = throwDices([{ type: 20, qty: 2 }])[0];
    console.log('throwDice best', throwDice.best);
    console.log('throwDice worst', throwDice.worst);
    console.log('throwDice results', throwDice.results);
  }, []);

  useEffect(() => {
    if (api !== undefined && !calledApi.current && id !== undefined) {
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
  }, [api, createAlert, getNewId, t, id]);

  if (loading) {
    return null;
  }

  if (notFound || character === null) {
    return <ErrorPage />;
  }

  return (
    <div className="character">
      <Atitle level={1}>{character.name}</Atitle>
      <Button onClick={testLaunchDice}>Click Me</Button>
      <Aicon type="d20" className="character__test" size="large" />
      <RollTab />
    </div>
  );
};

export default Character;
