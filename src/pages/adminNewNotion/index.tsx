import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import {
  Alert,
  RichTextElement,
  SmartSelect,
  completeRichTextElementExtentions,
  type ISingleValueSelect,
} from '../../organisms';

import { type ICuratedRuleBook } from '../../interfaces';

import './adminNewNotion.scss';

const AdminNewNotions: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const calledApi = useRef(false);

  const [notionName, setNotionName] = useState('');
  const [notionNameFr, setNotionNameFr] = useState('');

  const [notionText] = useState('');
  const [notionTextFr] = useState('');

  const [ruleBooks, setRulebooks] = useState<ISingleValueSelect[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [error, setError] = useState('');

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const textFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const onSaveNotion = useCallback(
    (elt) => {
      if (textEditor === null || textFrEditor === null || api === undefined) {
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
          .create({
            title: notionName,
            ruleBook: selectedType,
            text: htmlText,
            i18n,
          })
          .then((notion) => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('adminNewNotion.successCreate', { ns: 'pages' })}</Ap>
                </Alert>
              ),
            });
            navigate(`/admin/notion/${notion._id}`);
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
      textEditor,
      textFrEditor,
      api,
      notionName,
      selectedType,
      t,
      notionNameFr,
      getNewId,
      createAlert,
      navigate,
    ]
  );

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
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
  }, [api, createAlert, getNewId, t]);

  const sentApiTypeChoice = useMemo(() => {
    if (params.get('ruleBookId') === undefined || ruleBooks.length === 0) {
      return null;
    }
    const selectedfield = ruleBooks.find((ruleBook) => ruleBook.value === params.get('ruleBookId'));
    if (selectedfield !== undefined) {
      setSelectedType(selectedfield.value);
      return selectedfield;
    }
    return null;
  }, [params, ruleBooks]);

  return (
    <div className="adminNewNotion">
      <Atitle level={1}>{t('adminNewNotion.title', { ns: 'pages' })}</Atitle>
      {error !== '' ? <Aerror className="adminNewNotion__error">{error}</Aerror> : null}
      <div className="adminNewNotion__basics">
        <Input
          type="text"
          onChange={(e) => {
            setNotionName(e.target.value);
            setError('');
          }}
          value={notionName}
          label={t('nameNotion.label', { ns: 'fields' })}
          className="adminNewNotion__basics__name"
        />
        <SmartSelect
          label={t('notionRuleBookType.title', { ns: 'fields' })}
          options={ruleBooks}
          selected={sentApiTypeChoice}
          onChange={(choice) => {
            setSelectedType(choice.value);
            setError('');
          }}
          className="adminNewNotion__basics__type"
        />
      </div>
      <div className="adminNewNotion__details">
        <RichTextElement
          label={t('notionText.title', { ns: 'fields' })}
          editor={textEditor}
          rawStringContent={notionText}
        />
      </div>

      <Atitle className="adminNewNotion__intl" level={2}>
        {t('adminNewNotion.i18n', { ns: 'pages' })}
      </Atitle>
      <Ap className="adminNewNotion__intl-info">{t('adminNewNotion.i18nInfo', { ns: 'pages' })}</Ap>
      <div className="adminNewNotion__basics">
        <Input
          type="text"
          label={`${t('nameNotion.label', { ns: 'fields' })} (FR)`}
          onChange={(e) => {
            setNotionNameFr(e.target.value);
          }}
          value={notionNameFr}
          className="adminNewNotion__basics__name"
        />
      </div>
      <div className="adminNewNotion__details">
        <RichTextElement
          label={`${t('notionText.title', { ns: 'fields' })} (FR)`}
          editor={textFrEditor}
          rawStringContent={notionTextFr}
        />
      </div>
      <Button onClick={onSaveNotion} disabled={error !== ''}>
        {t('adminNewNotion.button', { ns: 'pages' })}
      </Button>
    </div>
  );
};

export default AdminNewNotions;
