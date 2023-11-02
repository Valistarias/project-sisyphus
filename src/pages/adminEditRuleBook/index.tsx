import React, { useCallback, type FC, useEffect, useState, useRef, useMemo } from 'react';
import i18next from 'i18next';

import { useEditor } from '@tiptap/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../providers/api';
import { useSystemAlerts } from '../../providers/systemAlerts';
import { useConfirmMessage } from '../../providers/confirmMessage';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import {
  Alert,
  type ISingleValueSelect,
  RichTextElement,
  SmartSelect,
  completeRichTextElementExtentions,
} from '../../organisms';

import { type ICuratedRuleBook, type IRuleBookType } from '../../interfaces';

import './adminEditRuleBook.scss';

const AdminEditRuleBooks: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { id } = useParams();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage();
  const navigate = useNavigate();

  const calledApi = useRef(false);

  const [ruleBookName, setRuleBookName] = useState('');
  const [ruleBookNameFr, setRuleBookNameFr] = useState('');

  const [ruleBookSummary, setRuleBookSummary] = useState('');
  const [ruleBookSummaryFr, setRuleBookSummaryFr] = useState('');

  const [ruleBookTypes, setRuleBookTypes] = useState<ISingleValueSelect[]>([]);
  const [sentApiType, setSentApiType] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [error, setError] = useState('');

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const onSaveRuleBook = useCallback(
    (elt) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }
      if (ruleBookName === '') {
        setError(t('nameRuleBook.required', { ns: 'fields' }));
      } else if (selectedType === null) {
        setError(t('typeRuleBook.required', { ns: 'fields' }));
      } else {
        let html: string | null = introEditor.getHTML();
        const htmlFr = introFrEditor.getHTML();
        if (html === '<p class="ap"></p>') {
          html = null;
        }

        let i18n: any | null = null;

        if (ruleBookNameFr !== '' || htmlFr !== '<p class="ap"></p>') {
          i18n = {
            fr: {
              title: ruleBookNameFr,
              summary: htmlFr,
            },
          };
        }

        api.ruleBooks
          .update({
            id,
            title: ruleBookName,
            type: selectedType,
            summary: html,
            i18n,
          })
          .then((rulebook) => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('adminEditRuleBook.successUpdate', { ns: 'pages' })}</Ap>
                </Alert>
              ),
            });
          })
          .catch(({ response }) => {
            const { data } = response;
            console.log('data', data);
            if (data.code === 'CYPU-104') {
              setError(
                t(`serverErrors.${data.code}`, {
                  field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize'),
                })
              );
            } else {
              setError(
                t(`serverErrors.${data.code}`, {
                  field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize'),
                })
              );
            }
          });
      }
    },
    [
      id,
      introEditor,
      introFrEditor,
      api,
      ruleBookName,
      selectedType,
      t,
      ruleBookNameFr,
      getNewId,
      createAlert,
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditRuleBook.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditRuleBook.confirmDeletion.text', { ns: 'pages', elt: ruleBookName }),
        confirmCta: t('adminEditRuleBook.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.ruleBooks
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditRuleBook.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                navigate('/admin/rulebooks');
              })
              .catch(({ response }) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError(
                    t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize'),
                    })
                  );
                } else {
                  setError(
                    t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize'),
                    })
                  );
                }
              });
          }
          ConfMessageEvent.removeEventListener(evtId, confirmDelete);
        };
        ConfMessageEvent.addEventListener(evtId, confirmDelete);
      }
    );
  }, [
    api,
    setConfirmContent,
    ConfMessageEvent,
    id,
    getNewId,
    createAlert,
    t,
    navigate,
    ruleBookName,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined) {
      api.ruleBookTypes
        .getAll()
        .then((data: IRuleBookType[]) => {
          setRuleBookTypes(
            data.map((ruleBookType) => ({
              value: ruleBookType._id,
              label: t(`ruleBookTypeNames.${ruleBookType.name}`, { count: 1 }),
              details: ruleBookType.name,
            }))
          );
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
  }, [api, createAlert, getNewId, id, t]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.ruleBooks
        .get({ ruleBookId: id })
        .then(({ ruleBook, i18n }: ICuratedRuleBook) => {
          setRuleBookName(ruleBook.title);
          setRuleBookSummary(ruleBook.summary);
          setSentApiType(ruleBook.type._id);
          setSelectedType(ruleBook.type._id);
          if (i18n.fr !== undefined) {
            setRuleBookNameFr(i18n.fr.title ?? '');
            setRuleBookSummaryFr(i18n.fr.summary ?? '');
          }
        })
        .catch((res) => {
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
  }, [api, createAlert, getNewId, ruleBookTypes, id, t]);

  const sentApiTypeChoice = useMemo(() => {
    if (sentApiType === null || ruleBookTypes.length === 0) {
      return null;
    }
    const selectedfield = ruleBookTypes.find((ruleBookType) => ruleBookType.value === sentApiType);
    if (selectedfield !== undefined) {
      return selectedfield;
    }
    return null;
  }, [sentApiType, ruleBookTypes]);

  return (
    <div className="adminEditRuleBook">
      <div className="adminEditRuleBook__head">
        <Atitle level={1}>{t('adminEditRuleBook.title', { ns: 'pages' })}</Atitle>
        <Button onClick={onAskDelete} theme="error">
          {t('adminEditRuleBook.delete', { ns: 'pages' })}
        </Button>
      </div>
      <div className="adminEditRuleBook__content">
        <div className="adminEditRuleBook__content__left">
          {error !== '' ? <Aerror className="adminEditRuleBook__error">{error}</Aerror> : null}
          <div className="adminEditRuleBook__basics">
            <Input
              type="text"
              label={t('nameRuleBook.label', { ns: 'fields' })}
              onChange={(e) => {
                setRuleBookName(e.target.value);
                setError('');
              }}
              value={ruleBookName}
              className="adminEditRuleBook__basics__name"
            />
            <SmartSelect
              label={t('typeRuleBook.select', { ns: 'fields' })}
              options={ruleBookTypes}
              selected={sentApiTypeChoice}
              onChange={(choice) => {
                setSelectedType(choice.value);
                setError('');
              }}
              className="adminEditRuleBook__basics__type"
            />
          </div>
          <div className="adminEditRuleBook__details">
            <RichTextElement
              label={t('ruleBookSummary.title', { ns: 'fields' })}
              editor={introEditor}
              rawStringContent={ruleBookSummary}
              small
            />
          </div>

          <Atitle className="adminEditRuleBook__intl" level={2}>
            {t('adminEditRuleBook.i18n', { ns: 'pages' })}
          </Atitle>
          <Ap className="adminEditRuleBook__intl-info">
            {t('adminEditRuleBook.i18nInfo', { ns: 'pages' })}
          </Ap>
          <div className="adminEditRuleBook__basics">
            <Input
              type="text"
              label={`${t('nameRuleBook.label', { ns: 'fields' })} (FR)`}
              onChange={(e) => {
                setRuleBookNameFr(e.target.value);
              }}
              value={ruleBookNameFr}
              className="adminEditRuleBook__basics__name"
            />
          </div>
          <div className="adminEditRuleBook__details">
            <RichTextElement
              label={`${t('ruleBookSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent={ruleBookSummaryFr}
              small
            />
          </div>
          <Button onClick={onSaveRuleBook} disabled={error !== ''}>
            {t('adminEditRuleBook.button', { ns: 'pages' })}
          </Button>
        </div>
        <div className="adminEditRuleBook__content__right">
          <div className="adminEditRuleBook__block-children">
            <Atitle className="adminEditRuleBook__intl" level={2}>
              {t('adminEditRuleBook.notions', { ns: 'pages' })}
            </Atitle>
            <Button href={`/admin/notion/new?ruleBookId=${id}`}>
              {t('adminEditRuleBook.createNotion', { ns: 'pages' })}
            </Button>
          </div>
          <div className="adminEditRuleBook__block-children">
            <Atitle className="adminEditRuleBook__intl" level={2}>
              {t('adminEditRuleBook.chapters', { ns: 'pages' })}
            </Atitle>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditRuleBooks;
