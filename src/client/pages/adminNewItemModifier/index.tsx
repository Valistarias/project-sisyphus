import React, { useCallback, useEffect, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';

import './adminNewItemModifier.scss';

interface FormValues {
  name: string;
  nameFr: string;
  modifierId: string;
}

const AdminNewItemModifier: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { reloadItemModifiers } = useGlobalVars();

  const [, setLoading] = useState(true);
  const calledApi = useRef(false);

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

  const onSaveItemModifier: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, modifierId }) => {
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
            summary: htmlFr,
          },
        };
      }

      api.itemModifiers
        .create({
          title: name,
          modifierId,
          summary: html,
          i18n,
        })
        .then((itemModifier) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewItemModifier.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadItemModifiers();
          navigate(`/admin/itemmodifier/${itemModifier._id}`);
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: `${t(`serverErrors.${data.code}`, {
                field: 'Formula Id',
              })} by ${data.sent}`,
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
      reloadItemModifiers,
      navigate,
      setError,
    ]
  );

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
    }
  }, [api, createAlert, getNewId, t]);

  return (
    <div className="adminNewItemModifier">
      <form
        className="adminNewItemModifier__content"
        onSubmit={handleSubmit(onSaveItemModifier)}
        noValidate
      >
        <Atitle level={1}>{t('adminNewItemModifier.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewItemModifier__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameItemModifier.required', { ns: 'fields' }),
            }}
            label={t('nameItemModifier.label', { ns: 'fields' })}
            className="adminNewItemModifier__basics__name"
          />
        </div>
        <div className="adminNewItemModifier__details">
          <RichTextElement
            label={t('itemModifierSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={''}
            small
            complete
          />
          <Input
            control={control}
            inputName="modifierId"
            type="text"
            rules={{
              required: t('itemModifierFormula.required', { ns: 'fields' }),
              pattern: {
                value: /^([a-z]){3}$/,
                message: t('itemModifierFormula.format', { ns: 'fields' }),
              },
            }}
            label={t('itemModifierFormula.label', { ns: 'fields' })}
          />
        </div>

        <Atitle className="adminNewItemModifier__intl" level={2}>
          {t('adminNewItemModifier.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewItemModifier__intl-info">
          {t('adminNewItemModifier.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewItemModifier__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameItemModifier.label', { ns: 'fields' })} (FR)`}
            className="adminNewItemModifier__basics__name"
          />
        </div>
        <div className="adminNewItemModifier__details">
          <RichTextElement
            label={`${t('itemModifierSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent={''}
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewItemModifier.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewItemModifier;
