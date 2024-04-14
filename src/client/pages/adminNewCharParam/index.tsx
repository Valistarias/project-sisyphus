import React, { useCallback, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';

import './adminNewCharParam.scss';

interface FormValues {
  name: string;
  short: string;
  nameFr: string;
  shortFr: string;
}

const AdminNewCharParam: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { reloadCharParams } = useGlobalVars();

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<FieldValues>();

  const onSaveCharParam: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, short, shortFr }) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }
      let html: string | null = introEditor.getHTML();
      const htmlFr = introFrEditor.getHTML();
      if (html === '<p class="ap"></p>') {
        html = null;
      }

      let i18n: any | null = null;

      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        i18n = {
          fr: {
            title: nameFr,
            short: shortFr ?? '',
            summary: htmlFr,
          },
        };
      }

      api.charParams
        .create({
          title: name,
          short,
          summary: html,
          i18n,
        })
        .then((charParams) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewCharParam.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadCharParams();
          navigate(`/admin/charparam/${charParams._id}`);
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.charparamsType.${data.sent}`), 'capitalize'),
              }),
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
    [
      introEditor,
      introFrEditor,
      api,
      getNewId,
      createAlert,
      t,
      reloadCharParams,
      navigate,
      setError,
    ]
  );

  return (
    <div className="adminNewCharParam">
      <form
        className="adminNewCharParam__content"
        onSubmit={handleSubmit(onSaveCharParam)}
        noValidate
      >
        <Atitle level={1}>{t('adminNewCharParam.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewCharParam__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameCharParam.required', { ns: 'fields' }),
            }}
            label={t('nameCharParam.label', { ns: 'fields' })}
            className="adminNewCharParam__basics__name"
          />
          <Input
            control={control}
            inputName="short"
            type="text"
            rules={{
              required: t('nameCharParamShort.required', { ns: 'fields' }),
            }}
            label={t('nameCharParamShort.label', { ns: 'fields' })}
            className="adminNewCharParam__basics__name"
          />
        </div>
        <div className="adminNewCharParam__details">
          <RichTextElement
            label={t('charparamsSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={''}
            small
            complete
          />
        </div>

        <Atitle className="adminNewCharParam__intl" level={2}>
          {t('adminNewCharParam.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewCharParam__intl-info">
          {t('adminNewCharParam.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewCharParam__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameCharParam.label', { ns: 'fields' })} (FR)`}
            className="adminNewCharParam__basics__name"
          />
          <Input
            control={control}
            inputName="shortFr"
            type="text"
            label={`${t('nameCharParamShort.label', { ns: 'fields' })} (FR)`}
            className="adminNewCharParam__basics__name"
          />
        </div>
        <div className="adminNewCharParam__details">
          <RichTextElement
            label={`${t('charparamsSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent={''}
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewCharParam.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewCharParam;
