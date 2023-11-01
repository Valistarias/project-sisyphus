import React, { useCallback, type FC, useEffect, useState } from 'react';
import i18next from 'i18next';

import { useEditor } from '@tiptap/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../providers/api';
import { useSystemAlerts } from '../../providers/systemAlerts';

import { Aerror, Ainput, Ap, Atitle } from '../../atoms';
import { Button } from '../../molecules';
import { Alert, type ISingleValueSelect, RichTextElement, SmartSelect, completeRichTextElementExtentions } from '../../organisms';

import { type IRuleBook } from '../../interfaces';

import './adminNewNotion.scss';

const AdminNewNotions: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();

  const [notionName, setNotionName] = useState('');
  const [notionNameFr, setNotionNameFr] = useState('');

  const [notionShort] = useState('');
  const [notionShortFr] = useState('');

  const [notionText] = useState('');
  const [notionTextFr] = useState('');

  const [ruleBooks, setRulebooks] = useState<ISingleValueSelect[]>([]);
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
    if (shortEditor === null || shortFrEditor === null || textEditor === null || textFrEditor === null || api === undefined) { return; }
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

      api.notions.create({
        title: notionName,
        ruleBook: selectedType,
        short: htmlShort,
        text: htmlText,
        i18n
      })
        .then((notion) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert
                key={newId}
                id={newId}
                timer={5}
              >
                <Ap>{t('adminNewNotion.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          navigate(`/admin/notion/${notion._id}`);
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
    shortEditor,
    shortFrEditor,
    textEditor,
    textFrEditor,
    api,
    notionName,
    selectedType,
    t,
    notionNameFr,
    getNewId,
    createAlert,
    navigate
  ]);

  useEffect(() => {
    if (api !== undefined) {
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
  }, [api, createAlert, getNewId, t]);

  return (
    <div className="adminNewNotion">
      <Atitle level={1}>{t('adminNewNotion.title', { ns: 'pages' })}</Atitle>
      {
        error !== ''
          ? (
          <Aerror className="adminNewNotion__error">{error}</Aerror>
            )
          : null
      }
      <div className="adminNewNotion__basics">
        <Ainput
          type="text"
          placeholder={t('nameNotion.placeholder', { ns: 'fields' })}
          onChange={(e) => {
            setNotionName(e.target.value);
            setError('');
          }}
          value={notionName}
          className="adminNewNotion__basics__name"
        />
        <SmartSelect
          options={ruleBooks}
          placeholder={t('typeNotion.placeholder', { ns: 'fields' })}
          onChange={(choice) => {
            setSelectedType(choice.value);
            setError('');
          }}
          className="adminNewNotion__basics__type"
        />
      </div>
      <div className="adminNewNotion__details">
        <RichTextElement title={t('notionShort.title', { ns: 'fields' })} editor={shortEditor} rawStringContent={notionShort} />
        <RichTextElement title={t('notionText.title', { ns: 'fields' })} editor={textEditor} rawStringContent={notionText} />
      </div>

      <Atitle className="adminNewNotion__intl" level={2}>{t('adminNewNotion.i18n', { ns: 'pages' })}</Atitle>
      <Ap className="adminNewNotion__intl-info">{t('adminNewNotion.i18nInfo', { ns: 'pages' })}</Ap>
      <div className="adminNewNotion__basics">
        <Ainput
          type="text"
          placeholder={`${t('nameNotion.placeholder', { ns: 'fields' })} (FR)`}
          onChange={(e) => {
            setNotionNameFr(e.target.value);
          }}
          value={notionNameFr}
          className="adminNewNotion__basics__name"
        />
      </div>
      <div className="adminNewNotion__details">
        <RichTextElement title={`${t('notionShort.title', { ns: 'fields' })} (FR)`} editor={shortFrEditor} rawStringContent={notionShortFr} />
        <RichTextElement title={`${t('notionText.title', { ns: 'fields' })} (FR)`} editor={textFrEditor} rawStringContent={notionTextFr} />
      </div>
      <Button
        onClick={onSaveNotion}
        disabled={error !== ''}
      >
        {t('adminNewNotion.button', { ns: 'pages' })}
      </Button>
    </div>
  );
};

export default AdminNewNotions;
