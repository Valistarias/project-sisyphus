import React, {
  useCallback, useMemo, type FC
} from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import {
  useForm, type SubmitHandler
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useLocation, useNavigate
} from 'react-router-dom';

import {
  useApi, useSystemAlerts
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

import './adminNewPage.scss';
interface FormValues {
  name: string
  nameFr: string
}

const AdminNewPage: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { search } = useLocation();
  const navigate = useNavigate();
  const {
    createAlert, getNewId
  } = useSystemAlerts();

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const contentEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const contentFrEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors }
  } = useForm();

  const onSavePage: SubmitHandler<FormValues> = useCallback(
    ({
      name, nameFr
    }) => {
      if (
        contentEditor === null
        || contentFrEditor === null
        || api === undefined
      ) {
        return;
      }
      let html: string | null = contentEditor.getHTML();
      const htmlFr = contentFrEditor.getHTML();
      if (html === '<p class="ap"></p>') {
        html = null;
      }

      let i18n: InternationalizationType | null = null;

      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        i18n = { fr: {
          title: nameFr,
          content: htmlFr
        } };
      }

      api.pages
        .create({
          title: name,
          chapter: params.get('chapterId'),
          content: html,
          i18n
        })
        .then((page) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewPage.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          void navigate(`/admin/page/${page._id}`);
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.pageType.${data.sent}`), 'capitalize') })
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.pageType.${data.sent}`), 'capitalize') })
            });
          }
        });
    },
    [
      contentEditor,
      contentFrEditor,
      api,
      params,
      getNewId,
      createAlert,
      t,
      navigate,
      setError
    ]
  );

  return (
    <div className="adminNewPage">
      <form
        onSubmit={(evt) => {
          void handleSubmit(onSavePage)(evt);
        }}
        noValidate
        className="adminNewPage__content"
      >
        <Atitle level={1}>{t('adminNewPage.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminNewPage__basics">
          <Input
            control={control}
            inputName="name"
            rules={{ required: t('namePage.required', { ns: 'fields' }) }}
            type="text"
            label={t('namePage.label', { ns: 'fields' })}
            className="adminNewPage__basics__name"
          />
        </div>
        <div className="adminNewPage__details">
          <RichTextElement
            label={t('pageContent.title', { ns: 'fields' })}
            editor={contentEditor}
            rawStringContent=""
            ruleBookId={params.get('ruleBookId') ?? undefined}
            complete
          />
        </div>

        <Atitle className="adminNewPage__intl" level={2}>
          {t('adminNewPage.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewPage__intl-info">{t('adminNewPage.i18nInfo', { ns: 'pages' })}</Ap>
        <div className="adminNewPage__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('namePage.label', { ns: 'fields' })} (FR)`}
            className="adminNewPage__basics__name"
          />
        </div>
        <div className="adminNewPage__details">
          <RichTextElement
            label={`${t('pageContent.title', { ns: 'fields' })} (FR)`}
            editor={contentFrEditor}
            rawStringContent=""
            ruleBookId={params.get('ruleBookId') ?? undefined}
            complete
          />
        </div>
        <Button type="submit">{t('adminNewPage.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewPage;
