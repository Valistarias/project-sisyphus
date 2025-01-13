import React, { useCallback, useMemo, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';

import './adminNewChapter.scss';

interface FormValues {
  name: string
  nameFr: string
}

const AdminNewChapters: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const summaryEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const summaryFrEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors }
  } = useForm();

  const onSaveChapter: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr }) => {
      if (
        summaryEditor === null
        || summaryFrEditor === null
        || api === undefined
        || params.get('ruleBookId') === undefined
        || params.get('type') === undefined
      ) {
        return;
      }
      let html: string | null = summaryEditor.getHTML();
      const htmlFr = summaryFrEditor.getHTML();
      if (html === '<p class="ap"></p>') {
        html = null;
      }

      let i18n: any | null = null;

      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        i18n = {
          fr: {
            title: nameFr,
            summary: htmlFr
          }
        };
      }

      api.chapters
        .create({
          title: name,
          type: params.get('type'),
          ruleBook: params.get('ruleBookId'),
          summary: html,
          i18n
        })
        .then((chapter) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewChapter.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          void navigate(`/admin/chapter/${chapter._id}`);
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.chapterType.${data.sent}`), 'capitalize')
              })
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.chapterType.${data.sent}`), 'capitalize')
              })
            });
          }
        });
    },
    [summaryEditor, summaryFrEditor, api, params, getNewId, createAlert, t, navigate, setError]
  );

  return (
    <div className="adminNewChapter">
      <form onSubmit={handleSubmit(onSaveChapter)} noValidate className="adminNewChapter__content">
        <Atitle level={1}>{t('adminNewChapter.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminNewChapter__basics">
          <Input
            control={control}
            inputName="name"
            rules={{
              required: t('nameChapter.required', { ns: 'fields' })
            }}
            type="text"
            label={t('nameChapter.label', { ns: 'fields' })}
            className="adminNewChapter__basics__name"
          />
        </div>
        <div className="adminNewChapter__details">
          <RichTextElement
            label={t('chapterSummary.title', { ns: 'fields' })}
            editor={summaryEditor}
            rawStringContent=""
            ruleBookId={params.get('ruleBookId') ?? undefined}
            small
            complete
          />
        </div>

        <Atitle className="adminNewChapter__intl" level={2}>
          {t('adminNewChapter.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewChapter__intl-info">
          {t('adminNewChapter.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewChapter__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameChapter.label', { ns: 'fields' })} (FR)`}
            className="adminNewChapter__basics__name"
          />
        </div>
        <div className="adminNewChapter__details">
          <RichTextElement
            label={`${t('chapterSummary.title', { ns: 'fields' })} (FR)`}
            editor={summaryFrEditor}
            rawStringContent=""
            ruleBookId={params.get('ruleBookId') ?? undefined}
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewChapter.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewChapters;
