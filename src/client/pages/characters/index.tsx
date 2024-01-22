import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useApi, useConfirmMessage, useSystemAlerts } from '../../providers';

import { Ali, Ap, Atitle, Aul } from '../../atoms';
import { Button } from '../../molecules';
import { Alert } from '../../organisms';

import { type ICharacter } from '../../types/data';

import { classTrim } from '../../utils';

import './characters.scss';

const Characters: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage?.() ?? {
    setConfirmContent: () => {},
    ConfMessageEvent: {},
  };

  const [characters, setCharacters] = useState<ICharacter[]>([]);
  const [loading, setLoading] = useState(true);

  const calledApi = useRef(false);

  const characterReload = useCallback(() => {
    if (api !== undefined) {
      api.characters
        .getAll()
        .then((sentCharacters: ICharacter[]) => {
          setLoading(false);
          setCharacters(sentCharacters);
        })
        .catch(() => {
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
  }, [api, createAlert, getNewId, t]);

  const onDeleteCharacter = useCallback(
    (id: string, name: string) => {
      if (api === undefined) {
        return;
      }
      setConfirmContent(
        {
          title: t('characters.confirmDelete.title', { ns: 'pages' }),
          text: t('characters.confirmDelete.text', { ns: 'pages', elt: name }),
          confirmCta: t('characters.confirmDelete.confirmCta', { ns: 'pages' }),
        },
        (evtId: string) => {
          const confirmDelete = ({ detail }): void => {
            if (detail.proceed === true) {
              api.characters
                .delete({ id })
                .then(() => {
                  const newId = getNewId();
                  createAlert({
                    key: newId,
                    dom: (
                      <Alert key={newId} id={newId} timer={5}>
                        <Ap>{t('characters.successDelete', { ns: 'pages' })}</Ap>
                      </Alert>
                    ),
                  });
                  characterReload();
                })
                .catch(({ response }) => {
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
            ConfMessageEvent.removeEventListener(evtId, confirmDelete);
          };
          ConfMessageEvent.addEventListener(evtId, confirmDelete);
        }
      );
    },
    [api, setConfirmContent, t, ConfMessageEvent, getNewId, createAlert, characterReload]
  );

  const characterList = useMemo(() => {
    if (characters.length === 0) {
      return null;
    }
    return (
      <Aul className="characters__character-list" noPoints>
        {characters.map((character) => (
          <Ali
            className={classTrim(`
          characters__character-list__elt
        `)}
            key={character._id}
          >
            <Atitle className="characters__character-list__elt__title" level={3}>
              {character.name}
            </Atitle>
            <div className="characters__character-list__elt__buttons">
              <Button href={`/character/${character._id}`}>
                {t('characters.openCharacter', { ns: 'pages' })}
              </Button>
              <Button
                theme="text-only"
                color="error"
                onClick={() => {
                  onDeleteCharacter(character._id, character.name);
                }}
              >
                {t('characters.deleteCharacter', { ns: 'pages' })}
              </Button>
            </div>
          </Ali>
        ))}
      </Aul>
    );
  }, [characters, onDeleteCharacter, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
      characterReload();
    }
  }, [api, createAlert, getNewId, characterReload, t]);

  // TODO: Add loading state
  if (loading) {
    return null;
  }

  return (
    <div className="characters">
      <div className="characters__header">
        <Atitle level={1}>{t('characters.title', { ns: 'pages' })}</Atitle>
        <Button href="/character/new">{t('characters.create', { ns: 'pages' })}</Button>
      </div>
      {characterList}
    </div>
  );
};

export default Characters;
