import React, { useCallback, useEffect, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input, SmartSelect, type ISingleValueSelect } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';

import type { ErrorResponseType } from '../../../types';
import type { InternationalizationType } from '../../../types/global';

import './adminNewRuleBook.scss';

interface FormValues {
  name: string;
  nameFr: string;
  type: string;
}

const AdminNewRuleBooks: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { reloadRuleBooks } = useGlobalVars();

  const [ruleBookTypes, setRuleBookTypes] = useState<ISingleValueSelect[]>([]);

  const introEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const introFrEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm();

  const onSaveRuleBook: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, type }) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }
      let html: string | null = introEditor.getHTML();
      const htmlFr = introFrEditor.getHTML();
      if (html === '<p class="ap"></p>') {
        html = null;
      }

      let i18n: InternationalizationType | null = null;

      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        i18n = {
          fr: {
            title: nameFr,
            summary: htmlFr,
          },
        };
      }

      api.ruleBooks
        .create({
          title: name,
          type,
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
          reloadRuleBooks();
          void navigate(`/admin/ruleBook/${ruleBook._id}`);
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize'),
              }),
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize'),
              }),
            });
          }
        });
    },
    [introEditor, introFrEditor, api, getNewId, createAlert, t, reloadRuleBooks, navigate, setError]
  );

  useEffect(() => {
    if (api !== undefined) {
      api.ruleBookTypes
        .getAll()
        .then((data) => {
          setRuleBookTypes(
            data.map((ruleBookType) => ({
              value: ruleBookType._id,
              label: t(`ruleBookTypeNames.${ruleBookType.name}`, { count: 1 }),
              details: ruleBookType.name,
            }))
          );
        })
        .catch(({ response }: ErrorResponseType) => {
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
      <form
        className="adminNewRuleBook__content"
        onSubmit={(evt) => {
          void handleSubmit(onSaveRuleBook)(evt);
        }}
        noValidate
      >
        <Atitle level={1}>{t('adminNewRuleBook.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewRuleBook__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameRuleBook.required', { ns: 'fields' }) }}
            label={t('nameRuleBook.label', { ns: 'fields' })}
            className="adminNewRuleBook__basics__name"
          />
          <SmartSelect
            control={control}
            inputName="type"
            rules={{ required: t('typeRuleBook.required', { ns: 'fields' }) }}
            label={t('typeRuleBook.select', { ns: 'fields' })}
            options={ruleBookTypes}
            className="adminNewRuleBook__basics__type"
          />
        </div>
        <div className="adminNewRuleBook__details">
          <RichTextElement
            label={t('ruleBookSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
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
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameRuleBook.label', { ns: 'fields' })} (FR)`}
            className="adminNewRuleBook__basics__name"
          />
        </div>
        <div className="adminNewRuleBook__details">
          <RichTextElement
            label={`${t('ruleBookSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent=""
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewRuleBook.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewRuleBooks;
