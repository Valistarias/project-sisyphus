import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode
} from 'react';

import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

import {
  useApi, useSystemAlerts
} from '../../../providers';

import holoBackground from '../../../assets/imgs/tvbg2.gif';
import {
  Ali, Ap, Atitle, Aul, Avideo
} from '../../../atoms';
import { Button } from '../../../molecules';
import { Alert } from '../../../organisms';

import type { ICharacter } from '../../../types';

import { classTrim } from '../../../utils';

import './characters.scss';

const Characters: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  // const { cyberFrames } = useGlobalVars();

  const [characters, setCharacters] = useState<ICharacter[]>([]);
  // const [loading, setLoading] = useState(true);

  const calledApi = useRef(false);

  const characterReload = useCallback(() => {
    if (api !== undefined) {
      api.characters
        .getAll()
        .then((sentCharacters) => {
          // setLoading(false);
          setCharacters(sentCharacters);
        })
        .catch(() => {
          // setLoading(false);
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            )
          });
        });
    }
  }, [
    api,
    createAlert,
    getNewId,
    t
  ]);

  const characterList = useMemo(() => {
    if (characters.length === 0) {
      return null;
    }

    const charactersElt: ReactNode[] = [];

    characters.forEach((character) => {
      // const cyberFramesByNodes = getCyberFrameLevelsByNodes(character.nodes, cyberFrames);
      // TODO: add all parameters to this
      const { isReady } = character;
      let displayedName: string | undefined;
      if (
        character.nickName !== undefined
        || character.firstName !== undefined
      ) {
        displayedName
        = character.nickName
          ?? `${character.firstName} ${character.lastName}`;
      }
      let status: string;
      if (!isReady) {
        status = t(`terms.character.draft`);
      } else {
        status = t(`terms.character.alive`);
      }
      charactersElt.push(
        <Ali
          className={classTrim(`
          characters__character-list__elt
        `)}
          key={character._id}
        >
          <div
            className="characters__character-list__elt__img"
            style={{ backgroundImage: `url(${holoBackground})` }}
          >
            <Avideo className="characters__character-list__elt__img__animatedbg" video="logo" />
            {isReady
              ? (
                  <Button
                    theme="text-only"
                    className="characters__character-list__elt__img__edit"
                    href={`/character/${character._id}/edit`}
                  >
                    {t('characters.editCharacter', { ns: 'pages' })}
                  </Button>
                )
              : null}
          </div>
          <div className="characters__character-list__elt__title">
            <Atitle className="characters__character-list__elt__title__text" level={3}>
              {displayedName ?? t(`terms.character.unknown`)}
            </Atitle>
            <Ap className="characters__character-list__elt__title__status">{status}</Ap>
            {character.campaign !== undefined
              ? (
                  <Ap className="characters__character-list__elt__title__campaign">
                    {`${i18next.format(t(`terms.campaign.title`), 'capitalize')}: ${character.campaign.name}`}
                  </Ap>
                )
              : null}
          </div>
          <div className="characters__character-list__elt__buttons">
            <Button
              className="characters__character-list__elt__buttons__main"
              theme="afterglow"
              href={
                isReady
                  ? `/character/${character._id}`
                  : `/character/${character._id}/continue`
              }
            >
              {t(isReady ? 'characters.openCharacter' : 'characters.continueCharacter', { ns: 'pages' })}
            </Button>
          </div>
        </Ali>
      );
    });

    return (
      <Aul className="characters__character-list" noPoints>
        {charactersElt}
      </Aul>
    );
  }, [characters, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      characterReload();
    }
  }, [
    api,
    createAlert,
    getNewId,
    characterReload,
    t
  ]);

  return (
    <div className="characters">
      <div className="characters__header">
        <Atitle level={1}>{t('characters.title', { ns: 'pages' })}</Atitle>
        <Button theme="afterglow" href="/character/new">
          {t('characters.create', { ns: 'pages' })}
        </Button>
      </div>
      {characterList}
    </div>
  );
};

export default Characters;
