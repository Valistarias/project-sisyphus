import React, { useCallback, useEffect, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';

import type { ErrorResponseType } from '../../../types';
import type { InternationalizationType } from '../../../types/global';

import './adminNewArcane.scss';

interface FormValues {
  name: string;
  nameFr: string;
  number: number;
}

const AdminNewArcane: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { reloadArcanes } = useGlobalVars();

  const [, setLoading] = useState(true);
  const calledApi = useRef(false);

  const introEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const introFrEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm();

  const onSaveArcane: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, number }) => {
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

      api.arcanes
        .create({
          title: name,
          summary: html,
          number,
          i18n,
        })
        .then((arcane) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewArcane.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadArcanes();
          void navigate(`/admin/arcane/${arcane._id}`);
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: `${t(`serverErrors.${data.code}`, { field: 'Formula Id' })} by ${data.sent}`,
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.charparamsType.${data.sent}`), 'capitalize'),
              }),
            });
          }
        });
    },
    [introEditor, introFrEditor, api, getNewId, createAlert, t, reloadArcanes, navigate, setError]
  );

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
    }
  }, [api, createAlert, getNewId, t]);

  return (
    <div className="adminNewArcane">
      <form
        className="adminNewArcane__content"
        onSubmit={(evt) => {
          void handleSubmit(onSaveArcane)(evt);
        }}
        noValidate
      >
        <Atitle level={1}>{t('adminNewArcane.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewArcane__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameArcane.required', { ns: 'fields' }) }}
            label={t('nameArcane.label', { ns: 'fields' })}
            className="adminNewArcane__basics__name"
          />
          <div className="adminNewArcane__basics__class">
            <Input
              control={control}
              inputName="number"
              type="number"
              label={t('arcaneNumber.label', { ns: 'fields' })}
              rules={{ required: t('arcaneNumber.required', { ns: 'fields' }) }}
            />
          </div>
        </div>
        <div className="adminNewArcane__details">
          <RichTextElement
            label={t('arcaneSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
        </div>

        <Atitle className="adminNewArcane__intl" level={2}>
          {t('adminNewArcane.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewArcane__intl-info">
          {t('adminNewArcane.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewArcane__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameArcane.label', { ns: 'fields' })} (FR)`}
            className="adminNewArcane__basics__name"
          />
        </div>
        <div className="adminNewArcane__details">
          <RichTextElement
            label={`${t('arcaneSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent=""
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewArcane.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewArcane;
