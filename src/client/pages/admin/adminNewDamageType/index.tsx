import React, {
  useCallback, useEffect, useRef, useState, type FC
} from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import {
  useForm, type FieldValues, type SubmitHandler
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

import './adminNewDamageType.scss';

interface FormValues {
  name: string
  nameFr: string
}

const AdminNewDamageType: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const { reloadDamageTypes } = useGlobalVars();

  const [, setLoading] = useState(true);
  const calledApi = useRef(false);

  const introEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const introFrEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors }
  } = useForm();

  const onSaveDamageType: SubmitHandler<FormValues> = useCallback(
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

      let i18n: any | null = null;

      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        i18n = { fr: {
          title: nameFr,
          summary: htmlFr
        } };
      }

      api.damageTypes
        .create({
          title: name,
          summary: html,
          i18n
        })
        .then((damageType) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewDamageType.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          reloadDamageTypes();
          void navigate(`/admin/damagetype/${damageType._id}`);
        })
        .catch(({ response }) => {
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
      reloadDamageTypes,
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
    <div className="adminNewDamageType">
      <form
        className="adminNewDamageType__content"
        onSubmit={handleSubmit(onSaveDamageType)}
        noValidate
      >
        <Atitle level={1}>{t('adminNewDamageType.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminNewDamageType__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameDamageType.required', { ns: 'fields' }) }}
            label={t('nameDamageType.label', { ns: 'fields' })}
            className="adminNewDamageType__basics__name"
          />
        </div>
        <div className="adminNewDamageType__details">
          <RichTextElement
            label={t('damageTypeSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
        </div>

        <Atitle className="adminNewDamageType__intl" level={2}>
          {t('adminNewDamageType.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewDamageType__intl-info">
          {t('adminNewDamageType.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewDamageType__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameDamageType.label', { ns: 'fields' })} (FR)`}
            className="adminNewDamageType__basics__name"
          />
        </div>
        <div className="adminNewDamageType__details">
          <RichTextElement
            label={`${t('damageTypeSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent=""
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewDamageType.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewDamageType;
