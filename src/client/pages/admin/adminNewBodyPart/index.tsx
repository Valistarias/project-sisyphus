import React, {
  useCallback, useEffect, useRef, useState, type FC
} from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import {
  useForm, type SubmitHandler
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  useApi, useGlobalVars, useSystemAlerts
} from '../../../providers';

import {
  Aerror, Ap, Atitle
} from '../../../atoms';
import {
  Button, Input
} from '../../../molecules';
import {
  Alert, RichTextElement, completeRichTextElementExtentions
} from '../../../organisms';

import type { ErrorResponseType } from '../../../types';
import type { InternationalizationType } from '../../../types/global';

import './adminNewBodyPart.scss';

interface FormValues {
  name: string
  nameFr: string
  partId: string
  limit: number
}

const AdminNewBodyPart: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const { reloadBodyParts } = useGlobalVars();

  const [, setLoading] = useState(true);
  const calledApi = useRef(false);

  const introEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const introFrEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors }
  } = useForm();

  const onSaveBodyPart: SubmitHandler<FormValues> = useCallback(
    ({
      name, nameFr, partId, limit
    }) => {
      if (
        introEditor === null
        || introFrEditor === null
        || api === undefined
      ) {
        return;
      }
      let html: string | null = introEditor.getHTML();
      const htmlFr = introFrEditor.getHTML();
      if (html === '<p class="ap"></p>') {
        html = null;
      }

      let i18n: InternationalizationType | null = null;

      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        i18n = { fr: {
          title: nameFr,
          summary: htmlFr
        } };
      }

      api.bodyParts
        .create({
          title: name,
          summary: html,
          partId,
          limit: Number(limit),
          i18n
        })
        .then((bodyPart) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewBodyPart.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          reloadBodyParts();
          void navigate(`/admin/bodypart/${bodyPart._id}`);
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: `${t(`serverErrors.${data.code}`, { field: 'Formula Id' })} by ${data.sent}`
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.charparamsType.${data.sent}`), 'capitalize') })
            });
          }
        });
    },
    [
      introEditor,
      introFrEditor,
      api,
      getNewId,
      createAlert,
      t,
      reloadBodyParts,
      navigate,
      setError
    ]
  );

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
    }
  }, [
    api,
    createAlert,
    getNewId,
    t
  ]);

  return (
    <div className="adminNewBodyPart">
      <form
        className="adminNewBodyPart__content"
        onSubmit={(evt) => {
          void handleSubmit(onSaveBodyPart)(evt);
        }}
        noValidate
      >
        <Atitle level={1}>{t('adminNewBodyPart.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminNewBodyPart__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameBodyPart.required', { ns: 'fields' }) }}
            label={t('nameBodyPart.label', { ns: 'fields' })}
            className="adminNewBodyPart__basics__name"
          />
          <div className="adminNewBodyPart__basics__class">
            <Input
              control={control}
              inputName="limit"
              type="number"
              label={t('bodyPartLimit.label', { ns: 'fields' })}
              rules={{ required: t('bodyPartLimit.required', { ns: 'fields' }) }}
            />
          </div>
        </div>
        <div className="adminNewBodyPart__details">
          <RichTextElement
            label={t('bodyPartSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
          <Input
            control={control}
            inputName="partId"
            type="text"
            rules={{
              required: t('bodyPartFormula.required', { ns: 'fields' }),
              pattern: {
                value: /^([a-z]){2,3}$/,
                message: t('bodyPartFormula.format', { ns: 'fields' })
              }
            }}
            label={t('bodyPartFormula.label', { ns: 'fields' })}
          />
        </div>

        <Atitle className="adminNewBodyPart__intl" level={2}>
          {t('adminNewBodyPart.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewBodyPart__intl-info">
          {t('adminNewBodyPart.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewBodyPart__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameBodyPart.label', { ns: 'fields' })} (FR)`}
            className="adminNewBodyPart__basics__name"
          />
        </div>
        <div className="adminNewBodyPart__details">
          <RichTextElement
            label={`${t('bodyPartSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent=""
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewBodyPart.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewBodyPart;
