import React, { useCallback, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';

import './adminNewStat.scss';

interface FormValues {
  name: string;
  short: string;
  nameFr: string;
  shortFr: string;
}

const AdminNewStat: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();

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

  const onSaveStat: SubmitHandler<FormValues> = useCallback(
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

      api.stats
        .create({
          title: name,
          short,
          summary: html,
          i18n,
        })
        .then((stat) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewStat.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          navigate(`/admin/stat/${stat._id}`);
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.statType.${data.sent}`), 'capitalize'),
              }),
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.statType.${data.sent}`), 'capitalize'),
              }),
            });
          }
        });
    },
    [introEditor, introFrEditor, api, getNewId, createAlert, t, navigate, setError]
  );

  return (
    <div className="adminNewStat">
      <form className="adminNewStat__content" onSubmit={handleSubmit(onSaveStat)} noValidate>
        <Atitle level={1}>{t('adminNewStat.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewStat__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameStat.required', { ns: 'fields' }),
            }}
            label={t('nameStat.label', { ns: 'fields' })}
            className="adminNewStat__basics__name"
          />
          <Input
            control={control}
            inputName="short"
            type="text"
            rules={{
              required: t('nameStatShort.required', { ns: 'fields' }),
            }}
            label={t('nameStatShort.label', { ns: 'fields' })}
            className="adminNewStat__basics__name"
          />
        </div>
        <div className="adminNewStat__details">
          <RichTextElement
            label={t('statSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={''}
            small
            complete
          />
        </div>

        <Atitle className="adminNewStat__intl" level={2}>
          {t('adminNewStat.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewStat__intl-info">{t('adminNewStat.i18nInfo', { ns: 'pages' })}</Ap>
        <div className="adminNewStat__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameStat.label', { ns: 'fields' })} (FR)`}
            className="adminNewStat__basics__name"
          />
          <Input
            control={control}
            inputName="shortFr"
            type="text"
            label={`${t('nameStatShort.label', { ns: 'fields' })} (FR)`}
            className="adminNewStat__basics__name"
          />
        </div>
        <div className="adminNewStat__details">
          <RichTextElement
            label={`${t('statSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent={''}
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewStat.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewStat;
