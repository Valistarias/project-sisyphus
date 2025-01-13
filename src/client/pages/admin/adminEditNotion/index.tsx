import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input, SmartSelect, type ISingleValueSelect } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';

import type { ICuratedNotion } from '../../../types';

import './adminEditNotion.scss';

interface FormValues {
  name: string
  nameFr: string
  type: string
}

const AdminEditNotions: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const confMessageEvt = useConfirmMessage();
  const { id } = useParams();
  const { ruleBooks } = useGlobalVars();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [notionData, setNotionData] = useState<ICuratedNotion | null>(null);

  const [notionText, setNotionText] = useState('');
  const [notionTextFr, setNotionTextFr] = useState('');

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const textFrEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const createDefaultData = useCallback(
    (notionData: ICuratedNotion | null, ruleBooks: ISingleValueSelect[]) => {
      if (notionData == null) {
        return {};
      }
      const { notion, i18n } = notionData;
      const defaultData: Partial<FormValues> = {};
      defaultData.name = notion.title;
      const selectedfield = ruleBooks.find(notionType => notionType.value === notion.ruleBook);
      if (selectedfield !== undefined) {
        defaultData.type = String(selectedfield.value);
      }
      if (i18n.fr !== undefined) {
        defaultData.nameFr = i18n.fr.title ?? '';
      }

      return defaultData;
    },
    []
  );

  const ruleBookSelect = useMemo(() => ruleBooks.map(({ ruleBook }) => ({
    value: ruleBook._id,
    // TODO : Handle Internationalization
    label: ruleBook.title,
    details: t(`ruleBookTypeNames.${ruleBook.type.name}`, { count: 1 })
  })), [t, ruleBooks]);

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: useMemo(
      () => createDefaultData(notionData, ruleBookSelect),
      [createDefaultData, notionData, ruleBookSelect]
    )
  });

  const ruleBook = useMemo(() => notionData?.notion.ruleBook, [notionData]);

  const onSaveNotion: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, type }) => {
      if (
        notionText === null
        || notionTextFr === null
        || textEditor === null
        || textFrEditor === null
        || api === undefined
      ) {
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
            text: htmlTextFr
          }
        };
      }

      api.notions
        .update({
          id,
          title: name,
          ruleBook: type,
          text: htmlText,
          i18n
        })
        .then((rulebook) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditNotion.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.notionType.${data.sent}`), 'capitalize')
              })
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.notionType.${data.sent}`), 'capitalize')
              })
            });
          }
        });
    },
    [
      notionText,
      notionTextFr,
      textEditor,
      textFrEditor,
      api,
      id,
      getNewId,
      createAlert,
      t,
      setError
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || confMessageEvt === null) {
      return;
    }
    confMessageEvt.setConfirmContent(
      {
        title: t('adminEditNotion.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditNotion.confirmDeletion.text', {
          ns: 'pages',
          elt: notionData?.notion.title
        }),
        confirmCta: t('adminEditNotion.confirmDeletion.confirmCta', { ns: 'pages' })
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.notions
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditNotion.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  )
                });
                void navigate('/admin/rulebooks');
              })
              .catch(({ response }) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize')
                    })
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize')
                    })
                  });
                }
              });
          }
          confMessageEvt.removeConfirmEventListener(evtId, confirmDelete);
        };
        confMessageEvt.addConfirmEventListener(evtId, confirmDelete);
      }
    );
  }, [api, confMessageEvt, t, notionData?.notion.title, id, getNewId, createAlert, navigate, setError]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.notions
        .get({ notionId: id })
        .then((curatedNotion: ICuratedNotion) => {
          const { notion, i18n } = curatedNotion;
          setNotionData(curatedNotion);
          setNotionText(notion.text);
          if (i18n.fr !== undefined) {
            setNotionTextFr(i18n.fr.summary ?? '');
          }
        })
        .catch(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            )
          });
        });
    }
  }, [api, createAlert, getNewId, ruleBooks, id, t]);

  // The Autosave
  useEffect(() => {
    saveTimer.current = setInterval(() => {
      silentSave.current = true;
      handleSubmit(onSaveNotion)().then(
        () => {},
        () => {}
      );
    }, 600000);

    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveNotion]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(notionData, ruleBookSelect));
  }, [notionData, ruleBookSelect, reset, createDefaultData]);

  return (
    <div className="adminEditNotion">
      <form onSubmit={handleSubmit(onSaveNotion)} noValidate className="adminEditNotion__content">
        <div className="adminEditNotion__head">
          <Atitle level={1}>{t('adminEditNotion.title', { ns: 'pages' })}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditNotion.delete', { ns: 'pages' })}
          </Button>
        </div>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror className="adminEditNotion__error">{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminEditNotion__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameNotion.required', { ns: 'fields' }) }}
            label={t('nameNotion.label', { ns: 'fields' })}
            className="adminEditNotion__basics__name"
          />
          <SmartSelect
            control={control}
            inputName="type"
            rules={{ required: t('linkedRuleBook.required', { ns: 'fields' }) }}
            label={t('notionRuleBookType.title', { ns: 'fields' })}
            options={ruleBookSelect}
            className="adminEditNotion__basics__type"
          />
        </div>
        <div className="adminEditNotion__details">
          <RichTextElement
            label={t('notionText.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={notionText}
            ruleBookId={ruleBook ?? undefined}
          />
        </div>

        <Atitle className="adminEditNotion__intl" level={2}>
          {t('adminEditNotion.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminEditNotion__intl-info">
          {t('adminEditNotion.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminEditNotion__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameNotion.label', { ns: 'fields' })} (FR)`}
            className="adminEditNotion__basics__name"
          />
        </div>
        <div className="adminEditNotion__details">
          <RichTextElement
            label={`${t('notionText.title', { ns: 'fields' })} (FR)`}
            editor={textFrEditor ?? undefined}
            rawStringContent={notionTextFr}
            ruleBookId={ruleBook ?? undefined}
          />
        </div>
        <Button type="submit">{t('adminEditNotion.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditNotions;
