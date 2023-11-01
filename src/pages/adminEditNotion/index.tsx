import React, { useCallback, type FC, useEffect, useState, useRef, useMemo } from 'react';
import i18next from 'i18next';

import { useEditor } from '@tiptap/react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../providers/api';
import { useSystemAlerts } from '../../providers/systemAlerts';

import { Aerror, Ainput, Ap, Atitle } from '../../atoms';
import { Button } from '../../molecules';
import { Alert, type ISingleValueSelect, RichTextElement, SmartSelect, completeRichTextElementExtentions } from '../../organisms';

import { type ICuratedNotion, type IRuleBook } from '../../interfaces';

import './adminEditNotion.scss';

const AdminEditNotions: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { id } = useParams();

  const calledApi = useRef(false);

  const [notionName, setNotionName] = useState('');
  const [notionNameFr, setNotionNameFr] = useState('');

  const [notionShort, setNotionShort] = useState('');
  const [notionShortFr, setNotionShortFr] = useState('');

  const [notionText, setNotionText] = useState('');
  const [notionTextFr, setNotionTextFr] = useState('');

  const [ruleBooks, setRulebooks] = useState<ISingleValueSelect[]>([]);
  const [sentApiRuleBook, setSentApiRuleBook] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [error, setError] = useState('');

  const shortEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const shortFrEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const textFrEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const onSaveNotion = useCallback((elt) => {
    if (
      shortEditor === null ||
      shortFrEditor === null ||
      notionText === null ||
      notionTextFr === null ||
      textEditor === null ||
      textFrEditor === null ||
      api === undefined
    ) { return; }
    if (notionName === '') {
      setError(t('nameNotion.required', { ns: 'fields' }));
    } else if (selectedType === null) {
      setError(t('typeNotion.required', { ns: 'fields' }));
    } else {
      let htmlShort: string | null = shortEditor.getHTML();
      let htmlText: string | null = textEditor.getHTML();

      const htmlShortFr = shortFrEditor.getHTML();
      const htmlTextFr = textFrEditor.getHTML();
      if (htmlShort === '<p class="ap"></p>') {
        htmlShort = null;
      }

      if (htmlText === '<p class="ap"></p>') {
        htmlText = null;
      }

      let i18n: any | null = null;

      if (notionNameFr !== '' || htmlShortFr !== '<p class="ap"></p>') {
        i18n = {
          fr: {
            title: notionNameFr,
            short: htmlShortFr,
            text: htmlTextFr
          }
        };
      }

      api.notions.update({
        id,
        title: notionName,
        ruleBook: selectedType,
        short: htmlShort,
        text: htmlText,
        i18n
      })
        .then((rulebook) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert
                key={newId}
                id={newId}
                timer={5}
              >
                <Ap>{t('adminEditNotion.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError(t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`terms.notionType.${data.sent}`), 'capitalize')
            }));
          } else {
            setError(t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`terms.notionType.${data.sent}`), 'capitalize')
            }));
          }
        });
    }
  }, [
    id,
    shortEditor,
    shortFrEditor,
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
    createAlert
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined) {
      api.ruleBooks.getAll()
        .then((data: IRuleBook[]) => {
          setRulebooks(
            data.map((rulebook) => ({
              value: rulebook._id,
              // TODO : Handle Internationalization
              label: rulebook.title,
              details: t(`rulebookNames.${rulebook.type.name}`, { count: 1 })
            }))
          );
        })
        .catch(({ response }) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert
                key={newId}
                id={newId}
                timer={5}
              >
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            )
          });
        });
    }
  }, [api, createAlert, getNewId, id, t]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.notions.get({ notionId: id })
        .then(({ notion, i18n }: ICuratedNotion) => {
          setNotionName(notion.title);
          setNotionShort(notion.short);
          setNotionText(notion.text);
          setSentApiRuleBook(notion.ruleBook._id);
          if (i18n.fr !== undefined) {
            setNotionNameFr(i18n.fr.title ?? '');
            setNotionShortFr(i18n.fr.short ?? '');
            setNotionTextFr(notion.text);
          }
        })
        .catch(({ response }) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
            <Alert
              key={newId}
              id={newId}
              timer={5}
            >
              <Ap>{t('serverErrors.CYPU-301')}</Ap>
            </Alert>
            )
          });
        });
    }
  }, [api, createAlert, getNewId, ruleBooks, id, t]);

  const sentApiRuleBookChoice = useMemo(() => {
    if (sentApiRuleBook === null || ruleBooks.length === 0) { return null; }
    const selectedfield = ruleBooks.find((notionType) => notionType.value === sentApiRuleBook);
    if (selectedfield !== undefined) {
      return selectedfield;
    }
    return null;
  }, [sentApiRuleBook, ruleBooks]);

  return (
    <div className="adminEditNotion">
      <Atitle level={1}>{t('adminEditNotion.title', { ns: 'pages' })}</Atitle>
      {
        error !== ''
          ? (
          <Aerror className="adminEditNotion__error">{error}</Aerror>
            )
          : null
      }
      <div className="adminEditNotion__basics">
        <Ainput
          type="text"
          placeholder={t('nameNotion.placeholder', { ns: 'fields' })}
          onChange={(e) => {
            setNotionName(e.target.value);
            setError('');
          }}
          value={notionName}
          className="adminEditNotion__basics__name"
        />
        <SmartSelect
          options={ruleBooks}
          placeholder={t('typeNotion.placeholder', { ns: 'fields' })}
          selected={sentApiRuleBookChoice}
          onChange={(choice) => {
            setSelectedType(choice.value);
            setError('');
          }}
          className="adminEditNotion__basics__type"
        />
      </div>
      <div className="adminEditNotion__details">
        <RichTextElement title={t('notionShort.title', { ns: 'fields' })} editor={shortEditor} rawStringContent={notionShort} small />
        <RichTextElement title={t('notionText.title', { ns: 'fields' })} editor={textEditor} rawStringContent={notionText} />
      </div>

      <Atitle className="adminEditNotion__intl" level={2}>{t('adminEditNotion.i18n', { ns: 'pages' })}</Atitle>
      <Ap className="adminEditNotion__intl-info">{t('adminEditNotion.i18nInfo', { ns: 'pages' })}</Ap>
      <div className="adminEditNotion__basics">
        <Ainput
          type="text"
          placeholder={`${t('nameNotion.placeholder', { ns: 'fields' })} (FR)`}
          onChange={(e) => {
            setNotionNameFr(e.target.value);
          }}
          value={notionNameFr}
          className="adminEditNotion__basics__name"
        />
      </div>
      <div className="adminEditNotion__details">
        <RichTextElement title={`${t('notionShort.title', { ns: 'fields' })} (FR)`} editor={shortFrEditor} rawStringContent={notionShortFr} small />
        <RichTextElement title={`${t('notionText.title', { ns: 'fields' })} (FR)`} editor={textFrEditor} rawStringContent={notionTextFr} />
      </div>
      <Button
        onClick={onSaveNotion}
        disabled={error !== ''}
      >
        {t('adminEditNotion.button', { ns: 'pages' })}
      </Button>
    </div>
  );
};

export default AdminEditNotions;
