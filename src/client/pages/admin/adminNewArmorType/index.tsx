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

import type { ErrorResponseType, InternationalizationType } from '../../../types/global';

import './adminNewArmorType.scss';

interface FormValues {
  name: string
  nameFr: string
}

const AdminNewArmorType: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const { reloadArmorTypes } = useGlobalVars();

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

  const onSaveArmorType: SubmitHandler<FormValues> = useCallback(
    ({
      name, nameFr
    }) => {
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
        i18n = { fr: {
          title: nameFr,
          summary: htmlFr
        } };
      }

      api.armorTypes
        .create({
          title: name,
          summary: html,
          i18n
        })
        .then((armorType) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewArmorType.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          reloadArmorTypes();
          void navigate(`/admin/armortype/${armorType._id}`);
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
      reloadArmorTypes,
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
    <div className="adminNewArmorType">
      <form
        className="adminNewArmorType__content"
        onSubmit={() => handleSubmit(onSaveArmorType)}
        noValidate
      >
        <Atitle level={1}>{t('adminNewArmorType.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminNewArmorType__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameArmorType.required', { ns: 'fields' }) }}
            label={t('nameArmorType.label', { ns: 'fields' })}
            className="adminNewArmorType__basics__name"
          />
        </div>
        <div className="adminNewArmorType__details">
          <RichTextElement
            label={t('armorTypeSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
        </div>

        <Atitle className="adminNewArmorType__intl" level={2}>
          {t('adminNewArmorType.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewArmorType__intl-info">
          {t('adminNewArmorType.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewArmorType__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameArmorType.label', { ns: 'fields' })} (FR)`}
            className="adminNewArmorType__basics__name"
          />
        </div>
        <div className="adminNewArmorType__details">
          <RichTextElement
            label={`${t('armorTypeSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent=""
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewArmorType.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewArmorType;
