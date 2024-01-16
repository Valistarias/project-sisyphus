import React, { useCallback, useEffect, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import {
  Alert,
  RichTextElement,
  SmartSelect,
  completeRichTextElementExtentions,
  type ISingleValueSelect,
} from '../../organisms';

import { type IRuleBookType } from '../../interfaces';

import './adminNewRuleBook.scss';

const AdminNewRuleBooks: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { triggerRuleBookReload } = useGlobalVars();

  const [ruleBookName, setRuleBookName] = useState('');
  const [ruleBookNameFr, setRuleBookNameFr] = useState('');

  const [ruleBookSummary] = useState('');
  const [ruleBookSummaryFr] = useState('');

  const [ruleBookTypes, setRuleBookTypes] = useState<ISingleValueSelect[]>([]);
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
          .create({
            title: ruleBookName,
            type: selectedType,
            summary: html,
            i18n,
          })
          .then((ruleBook) => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('adminNewRuleBook.successCreate', { ns: 'pages' })}</Ap>
                </Alert>
              ),
            });
            triggerRuleBookReload();
            navigate(`/admin/ruleBook/${ruleBook._id}`);
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
    },
    [
      introEditor,
      introFrEditor,
      api,
      ruleBookName,
      selectedType,
      t,
      ruleBookNameFr,
      getNewId,
      createAlert,
      navigate,
      triggerRuleBookReload,
    ]
  );

  useEffect(() => {
    if (api !== undefined) {
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
  }, [api, createAlert, getNewId, t]);

  return (
    <div className="adminNewRuleBook">
      <div className="adminNewRuleBook__content">
        <Atitle level={1}>{t('adminNewRuleBook.title', { ns: 'pages' })}</Atitle>
        {error !== '' ? <Aerror className="adminNewRuleBook__error">{error}</Aerror> : null}
        <div className="adminNewRuleBook__basics">
          <Input
            type="text"
            label={t('nameRuleBook.label', { ns: 'fields' })}
            onChange={(e) => {
              setRuleBookName(e.target.value);
              setError('');
            }}
            value={ruleBookName}
            className="adminNewRuleBook__basics__name"
          />
          <SmartSelect
            label={t('typeRuleBook.select', { ns: 'fields' })}
            options={ruleBookTypes}
            onChange={(choice) => {
              setSelectedType(choice.value);
              setError('');
            }}
            className="adminNewRuleBook__basics__type"
          />
        </div>
        <div className="adminNewRuleBook__details">
          <RichTextElement
            label={t('ruleBookSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={ruleBookSummary}
            small
            complete
          />
        </div>

        <Atitle className="adminNewRuleBook__intl" level={2}>
          {t('adminNewRuleBook.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewRuleBook__intl-info">
          {t('adminNewRuleBook.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewRuleBook__basics">
          <Input
            type="text"
            label={`${t('nameRuleBook.label', { ns: 'fields' })} (FR)`}
            onChange={(e) => {
              setRuleBookNameFr(e.target.value);
            }}
            value={ruleBookNameFr}
            className="adminNewRuleBook__basics__name"
          />
        </div>
        <div className="adminNewRuleBook__details">
          <RichTextElement
            label={`${t('ruleBookSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent={ruleBookSummaryFr}
            small
            complete
          />
        </div>
        <Button onClick={onSaveRuleBook} disabled={error !== ''}>
          {t('adminNewRuleBook.button', { ns: 'pages' })}
        </Button>
      </div>
    </div>
  );
};

export default AdminNewRuleBooks;
