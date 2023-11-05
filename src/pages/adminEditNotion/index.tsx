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

import { type ICuratedNotion, type ICuratedRuleBook } from '../../interfaces';

import './adminEditNotion.scss';

const AdminEditNotions: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage();
  const { id } = useParams();
  const navigate = useNavigate();

  const calledApi = useRef(false);

  const [notionName, setNotionName] = useState('');
  const [notionNameFr, setNotionNameFr] = useState('');

  const [notionText, setNotionText] = useState('');
  const [notionTextFr, setNotionTextFr] = useState('');

  const [ruleBooks, setRulebooks] = useState<ISingleValueSelect[]>([]);
  const [sentApiRuleBook, setSentApiRuleBook] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [error, setError] = useState('');

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const textFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const sentApiRuleBookChoice = useMemo(() => {
    if (sentApiRuleBook === null || ruleBooks.length === 0) {
      return null;
    }
    const selectedfield = ruleBooks.find((notionType) => notionType.value === sentApiRuleBook);
    if (selectedfield !== undefined) {
      return selectedfield;
    }
    return null;
  }, [sentApiRuleBook, ruleBooks]);

  const onSaveNotion = useCallback(
    (elt) => {
      if (
        notionText === null ||
        notionTextFr === null ||
        textEditor === null ||
        textFrEditor === null ||
        api === undefined
      ) {
        return;
      }
      if (notionName === '') {
        setError(t('nameNotion.required', { ns: 'fields' }));
      } else if (selectedType === null) {
        setError(t('typeNotion.required', { ns: 'fields' }));
      } else {
        let htmlText: string | null = textEditor.getHTML();

        const htmlTextFr = textFrEditor.getHTML();

        if (htmlText === '<p class="ap"></p>') {
          htmlText = null;
        }

        let i18n: any | null = null;

        if (notionNameFr !== '' || htmlTextFr !== '<p class="ap"></p>') {
          i18n = {
            fr: {
              title: notionNameFr,
              text: htmlTextFr,
            },
          };
        }

        api.notions
          .update({
            id,
            title: notionName,
            ruleBook: selectedType,
            text: htmlText,
            i18n,
          })
          .then((rulebook) => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('adminEditNotion.successUpdate', { ns: 'pages' })}</Ap>
                </Alert>
              ),
            });
          })
          .catch(({ response }) => {
            const { data } = response;
            if (data.code === 'CYPU-104') {
              setError(
                t(`serverErrors.${data.code}`, {
                  field: i18next.format(t(`terms.notionType.${data.sent}`), 'capitalize'),
                })
              );
            } else {
              setError(
                t(`serverErrors.${data.code}`, {
                  field: i18next.format(t(`terms.notionType.${data.sent}`), 'capitalize'),
                })
              );
            }
          });
      }
    },
    [
      id,
      textEditor,
      textFrEditor,
      api,
      notionName,
      notionText,
      selectedType,
      t,
      notionNameFr,
      notionTextFr,
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
        title: t('adminEditNotion.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditNotion.confirmDeletion.text', { ns: 'pages', elt: notionName }),
        confirmCta: t('adminEditNotion.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.notions
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditNotion.successDelete', { ns: 'pages' })}</Ap>
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
    notionName,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.notions
        .get({ notionId: id })
        .then(({ notion, i18n }: ICuratedNotion) => {
          setNotionName(notion.title);
          setNotionText(notion.text);
          setSentApiRuleBook(notion.ruleBook);
          setSelectedType(notion.ruleBook);
          if (i18n.fr !== undefined) {
            setNotionNameFr(i18n.fr.title ?? '');
            setNotionTextFr(notion.text);
          }
        })
        .catch(() => {
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

      api.ruleBooks
        .getAll()
        .then((data: ICuratedRuleBook[]) => {
          setRulebooks(
            data.map(({ ruleBook }) => ({
              value: ruleBook._id,
              // TODO : Handle Internationalization
              label: ruleBook.title,
              details: t(`ruleBookTypeNames.${ruleBook.type.name}`, { count: 1 }),
            }))
          );
        })
        .catch((response) => {
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
  }, [api, createAlert, getNewId, ruleBooks, id, t]);

  return (
    <div className="adminEditNotion">
      <div className="adminEditNotion__head">
        <Atitle level={1}>{t('adminEditNotion.title', { ns: 'pages' })}</Atitle>
        <Button onClick={onAskDelete} theme="error">
          {t('adminEditNotion.delete', { ns: 'pages' })}
        </Button>
      </div>
      {error !== '' ? <Aerror className="adminEditNotion__error">{error}</Aerror> : null}
      <div className="adminEditNotion__basics">
        <Input
          type="text"
          label={t('nameNotion.label', { ns: 'fields' })}
          onChange={(e) => {
            setNotionName(e.target.value);
            setError('');
          }}
          value={notionName}
          className="adminEditNotion__basics__name"
        />
        <SmartSelect
          options={ruleBooks}
          selected={sentApiRuleBookChoice}
          label={t('notionRuleBookType.title', { ns: 'fields' })}
          onChange={(choice) => {
            setSelectedType(choice.value);
            setError('');
          }}
          className="adminEditNotion__basics__type"
        />
      </div>
      <div className="adminEditNotion__details">
        <RichTextElement
          label={t('notionText.title', { ns: 'fields' })}
          editor={textEditor}
          rawStringContent={notionText}
          ruleBookId={selectedType ?? undefined}
        />
      </div>

      <Atitle className="adminEditNotion__intl" level={2}>
        {t('adminEditNotion.i18n', { ns: 'pages' })}
      </Atitle>
      <Ap className="adminEditNotion__intl-info">
        {t('adminEditNotion.i18nInfo', { ns: 'pages' })}
      </Ap>
      <div className="adminEditNotion__basics">
        <Input
          type="text"
          label={`${t('nameNotion.label', { ns: 'fields' })} (FR)`}
          onChange={(e) => {
            setNotionNameFr(e.target.value);
          }}
          value={notionNameFr}
          className="adminEditNotion__basics__name"
        />
      </div>
      <div className="adminEditNotion__details">
        <RichTextElement
          label={`${t('notionText.title', { ns: 'fields' })} (FR)`}
          editor={textFrEditor}
          rawStringContent={notionTextFr}
          ruleBookId={selectedType ?? undefined}
        />
      </div>
      <Button onClick={onSaveNotion} disabled={error !== ''}>
        {t('adminEditNotion.button', { ns: 'pages' })}
      </Button>
    </div>
  );
};

export default AdminEditNotions;
