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

import './adminNewTipText.scss';
import type { ErrorResponseType, InternationalizationType } from '../../../types/global';

interface FormValues {
  name: string;
  nameFr: string;
  tipId: string;
}

const AdminNewTipText: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { reloadTipTexts } = useGlobalVars();

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

  const onSaveTipText: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, tipId }) => {
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

      api.tipTexts
        .create({
          title: name,
          tipId,
          summary: html,
          i18n,
        })
        .then((tipText) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewTipText.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadTipTexts();
          void navigate(`/admin/tiptext/${tipText._id}`);
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
    [introEditor, introFrEditor, api, getNewId, createAlert, t, reloadTipTexts, navigate, setError]
  );

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
    }
  }, [api, createAlert, getNewId, t]);

  return (
    <div className="adminNewTipText">
      <form
        className="adminNewTipText__content"
        onSubmit={(evt) => {
          void handleSubmit(onSaveTipText)(evt);
        }}
        noValidate
      >
        <Atitle level={1}>{t('adminNewTipText.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewTipText__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameTipText.required', { ns: 'fields' }) }}
            label={t('nameTipText.label', { ns: 'fields' })}
            className="adminNewTipText__basics__name"
          />
        </div>
        <div className="adminNewTipText__details">
          <RichTextElement
            label={t('tipTextSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
          <Input
            control={control}
            inputName="tipId"
            type="text"
            rules={{ required: t('tipTextFormula.required', { ns: 'fields' }) }}
            label={t('tipTextFormula.label', { ns: 'fields' })}
          />
        </div>

        <Atitle className="adminNewTipText__intl" level={2}>
          {t('adminNewTipText.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewTipText__intl-info">
          {t('adminNewTipText.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewTipText__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameTipText.label', { ns: 'fields' })} (FR)`}
            className="adminNewTipText__basics__name"
          />
        </div>
        <div className="adminNewTipText__details">
          <RichTextElement
            label={`${t('tipTextSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent=""
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewTipText.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewTipText;
