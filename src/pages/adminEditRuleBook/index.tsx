import React, { useCallback, type FC, useEffect, useState, useRef } from 'react';
import i18next from 'i18next';

import { useEditor } from '@tiptap/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../providers/api';
import { useSystemAlerts } from '../../providers/systemAlerts';

import { Aerror, Ainput, Ap, Atitle } from '../../atoms';
import { Button } from '../../molecules';
import { Alert, type ISingleValueSelect, RichTextElement, SmartSelect, completeRichTextElementExtentions } from '../../organisms';

import { type ICuratedRuleBook, type IRuleBookType } from '../../interfaces';

import './adminEditRuleBook.scss';

const AdminEditRuleBooks: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { id } = useParams();

  const calledApi = useRef(false);

  const [ruleBookName, setRuleBookName] = useState('');
  const [ruleBookNameFr, setRuleBookNameFr] = useState('');

  const [ruleBookSummary, setRuleBookSummary] = useState('');
  const [ruleBookSummaryFr, setRuleBookSummaryFr] = useState('');

  const [ruleBookTypes, setRuleBookTypes] = useState<ISingleValueSelect[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const [error, setError] = useState('');

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const onSaveRuleBook = useCallback((elt) => {
    if (introEditor === null || introFrEditor === null || api === undefined) { return; }
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

      let i18n: string | null = null;

      if (ruleBookNameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        const i18nContentFr = JSON.stringify({
          title: ruleBookNameFr,
          summary: htmlFr
        });

        i18n = JSON.stringify({
          fr: i18nContentFr
        });
      }

      api.ruleBooks.update({
        title: ruleBookName,
        type: selectedType,
        summary: html,
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
                <Ap>{t('adminRuleBooks.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          navigate(`/admin/rulebook/${rulebook._id}`);
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError(t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize')
            }));
          } else {
            setError(t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize')
            }));
          }
        });
    }
  }, [
    introEditor,
    introFrEditor,
    api,
    ruleBookName,
    selectedType,
    t,
    ruleBookNameFr,
    getNewId,
    createAlert,
    navigate
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined) {
      api.ruleBookTypes.getAll()
        .then((data: IRuleBookType[]) => {
          setRuleBookTypes(
            data.map((ruleBookType) => ({
              value: ruleBookType._id,
              label: t(`ruleBookTypeNames.${ruleBookType.name}`, { count: 1 }),
              details: ruleBookType.name
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
      api.ruleBooks.get({ ruleBookId: id })
        .then(({ ruleBook, i18n }: ICuratedRuleBook) => {
          setRuleBookName(ruleBook.title);
          setRuleBookSummary(ruleBook.summary);
          setSelectedType(ruleBook.type._id);
          if (i18n !== null) {
            setRuleBookNameFr(i18n.fr.title ?? '');
            setRuleBookSummaryFr(i18n.fr.summary ?? '');
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
  }, [api, createAlert, getNewId, id, t]);

  return (
    <div className="adminEditRuleBook">
      <Atitle level={1}>{t('adminEditRuleBook.title', { ns: 'pages' })}</Atitle>
      {
        error !== ''
          ? (
          <Aerror className="adminEditRuleBook__error">{error}</Aerror>
            )
          : null
      }
      <div className="adminEditRuleBook__basics">
        <Ainput
          type="text"
          placeholder={t('nameRuleBook.placeholder', { ns: 'fields' })}
          onChange={(e) => {
            setRuleBookName(e.target.value);
            setError('');
          }}
          value={ruleBookName}
          className="adminEditRuleBook__basics__name"
        />
        <SmartSelect
          options={ruleBookTypes}
          placeholder={t('typeRuleBook.placeholder', { ns: 'fields' })}
          onChange={(choice) => {
            setSelectedType(choice.value);
            setError('');
          }}
          className="adminEditRuleBook__basics__type"
        />
      </div>
      <div className="adminEditRuleBook__details">
        <RichTextElement title={t('ruleBookSummary.title', { ns: 'fields' })} editor={introEditor} rawStringContent={ruleBookSummary} />
      </div>

      <Atitle className="adminEditRuleBook__intl" level={2}>{t('adminEditRuleBook.i18n', { ns: 'pages' })}</Atitle>
      <Ap className="adminEditRuleBook__intl-info">{t('adminEditRuleBook.i18nInfo', { ns: 'pages' })}</Ap>
      <div className="adminEditRuleBook__basics">
        <Ainput
          type="text"
          placeholder={`${t('nameRuleBook.placeholder', { ns: 'fields' })} (FR)`}
          onChange={(e) => {
            setRuleBookNameFr(e.target.value);
          }}
          value={ruleBookNameFr}
          className="adminEditRuleBook__basics__name"
        />
      </div>
      <div className="adminEditRuleBook__details">
        <RichTextElement title={`${t('ruleBookSummary.title', { ns: 'fields' })} (FR)`} editor={introFrEditor} rawStringContent={ruleBookSummaryFr} />
      </div>
      <Button
        onClick={onSaveRuleBook}
        disabled={error !== ''}
      >
        Create Book
      </Button>
    </div>
  );
};

export default AdminEditRuleBooks;
