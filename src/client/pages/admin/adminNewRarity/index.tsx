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

import './adminNewRarity.scss';

interface FormValues {
  name: string
  nameFr: string
}

const AdminNewRarity: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const { reloadRarities } = useGlobalVars();

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

  const onSaveRarity: SubmitHandler<FormValues> = useCallback(
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

      api.rarities
        .create({
          title: name,
          summary: html,
          i18n
        })
        .then((rarity) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewRarity.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          reloadRarities();
          void navigate(`/admin/rarity/${rarity._id}`);
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
      reloadRarities,
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
    <div className="adminNewRarity">
      <form className="adminNewRarity__content" onSubmit={() => handleSubmit(onSaveRarity)} noValidate>
        <Atitle level={1}>{t('adminNewRarity.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminNewRarity__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameRarity.required', { ns: 'fields' }) }}
            label={t('nameRarity.label', { ns: 'fields' })}
            className="adminNewRarity__basics__name"
          />
        </div>
        <div className="adminNewRarity__details">
          <RichTextElement
            label={t('raritySummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
        </div>

        <Atitle className="adminNewRarity__intl" level={2}>
          {t('adminNewRarity.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewRarity__intl-info">
          {t('adminNewRarity.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewRarity__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameRarity.label', { ns: 'fields' })} (FR)`}
            className="adminNewRarity__basics__name"
          />
        </div>
        <div className="adminNewRarity__details">
          <RichTextElement
            label={`${t('raritySummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent=""
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewRarity.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewRarity;
