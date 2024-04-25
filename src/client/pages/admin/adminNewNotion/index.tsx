import React, { useCallback, useEffect, useMemo, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input, SmartSelect, type ISingleValueSelect } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';

import './adminNewNotion.scss';

interface FormValues {
  name: string;
  nameFr: string;
  type: string;
}

const AdminNewNotions: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { ruleBooks } = useGlobalVars();

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const textFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const createDefaultData = useCallback(
    (params: URLSearchParams, ruleBooks: ISingleValueSelect[]) => {
      if (params.get('ruleBookId') === undefined || ruleBooks.length === 0) {
        return {};
      }
      const selectedfield = ruleBooks.find(
        (ruleBook) => ruleBook.value === params.get('ruleBookId')
      );
      if (selectedfield !== undefined) {
        return { type: selectedfield.value };
      }
      return {};
    },
    []
  );

  const ruleBookSelect = useMemo(() => {
    return ruleBooks.map(({ ruleBook }) => ({
      value: ruleBook._id,
      // TODO : Handle Internationalization
      label: ruleBook.title,
      details: t(`ruleBookTypeNames.${ruleBook.type.name}`, { count: 1 }),
    }));
  }, [t, ruleBooks]);

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: useMemo(
      () => createDefaultData(params, ruleBookSelect),
      [createDefaultData, params, ruleBookSelect]
    ),
  });

  const onSaveNotion: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, type }) => {
      if (textEditor === null || textFrEditor === null || api === undefined) {
        return;
      }
      let htmlText: string | null = textEditor.getHTML();

      const htmlTextFr = textFrEditor.getHTML();

      if (htmlText === '<p class="ap"></p>') {
        htmlText = null;
      }

      let i18n: any | null = null;

      if (nameFr !== '' || htmlTextFr !== '<p class="ap"></p>') {
        i18n = {
          fr: {
            title: nameFr,
            text: htmlTextFr,
          },
        };
      }

      api.notions
        .create({
          title: name,
          ruleBook: type,
          text: htmlText,
          i18n,
        })
        .then((notion) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewNotion.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          navigate(`/admin/notion/${notion._id}`);
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.notionType.${data.sent}`), 'capitalize'),
              }),
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.notionType.${data.sent}`), 'capitalize'),
              }),
            });
          }
        });
    },
    [textEditor, textFrEditor, api, getNewId, createAlert, t, navigate, setError]
  );

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(params, ruleBookSelect));
  }, [params, ruleBookSelect, reset, createDefaultData]);

  return (
    <div className="adminNewNotion">
      <form onSubmit={handleSubmit(onSaveNotion)} noValidate className="adminNewNotion__content">
        <Atitle level={1}>{t('adminNewNotion.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewNotion__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameNotion.required', { ns: 'fields' }) }}
            label={t('nameNotion.label', { ns: 'fields' })}
            className="adminNewNotion__basics__name"
          />
          <SmartSelect
            control={control}
            inputName="type"
            rules={{ required: t('linkedRuleBook.required', { ns: 'fields' }) }}
            label={t('notionRuleBookType.title', { ns: 'fields' })}
            options={ruleBookSelect}
            className="adminNewNotion__basics__type"
          />
        </div>
        <div className="adminNewNotion__details">
          <RichTextElement
            label={t('notionText.title', { ns: 'fields' })}
            editor={textEditor}
            rawStringContent={''}
          />
        </div>

        <Atitle className="adminNewNotion__intl" level={2}>
          {t('adminNewNotion.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewNotion__intl-info">
          {t('adminNewNotion.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewNotion__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameNotion.label', { ns: 'fields' })} (FR)`}
            className="adminNewNotion__basics__name"
          />
        </div>
        <div className="adminNewNotion__details">
          <RichTextElement
            label={`${t('notionText.title', { ns: 'fields' })} (FR)`}
            editor={textFrEditor}
            rawStringContent={''}
          />
        </div>
        <Button type="submit">{t('adminNewNotion.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewNotions;
