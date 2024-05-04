import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';
import { type ICuratedTipText } from '../../../types';

import { classTrim } from '../../../utils';

import './adminEditTipText.scss';

interface FormValues {
  name: string;
  nameFr: string;
  tipId: string;
}

const AdminEditTipText: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { reloadTipTexts } = useGlobalVars();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage?.() ?? {
    setConfirmContent: () => {},
    ConfMessageEvent: {},
  };
  const { id } = useParams();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [displayInt, setDisplayInt] = useState(false);

  const [tipTextData, setTipTextData] = useState<ICuratedTipText | null>(null);

  const [tipTextText, setTipTextText] = useState('');
  const [tipTextTextFr, setTipTextTextFr] = useState('');

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const textFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const createDefaultData = useCallback((tipTextData: ICuratedTipText | null) => {
    if (tipTextData == null) {
      return {};
    }
    const { tipText, i18n } = tipTextData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = tipText.title;
    defaultData.tipId = tipText.tipId;
    if (i18n.fr !== undefined) {
      defaultData.nameFr = i18n.fr.title ?? '';
    }
    return defaultData;
  }, []);

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: useMemo(() => createDefaultData(tipTextData), [createDefaultData, tipTextData]),
  });

  const onSaveTipText: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, tipId }) => {
      if (
        tipTextText === null ||
        tipTextTextFr === null ||
        textEditor === null ||
        textFrEditor === null ||
        tipId === null ||
        api === undefined
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
            text: htmlTextFr,
          },
        };
      }

      api.tipTexts
        .update({
          id,
          title: name,
          tipId,
          summary: htmlText,
          i18n,
        })
        .then((tipText) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditTipText.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadTipTexts();
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
      tipTextText,
      tipTextTextFr,
      textEditor,
      textFrEditor,
      api,
      id,
      getNewId,
      createAlert,
      t,
      reloadTipTexts,
      setError,
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditTipText.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditTipText.confirmDeletion.text', {
          ns: 'pages',
          elt: tipTextData?.tipText.title,
        }),
        confirmCta: t('adminEditTipText.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.tipTexts
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditTipText.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                reloadTipTexts();
                navigate('/admin/tiptexts');
              })
              .catch(({ response }) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.tipText.name`), 'capitalize'),
                    }),
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.tipText.name`), 'capitalize'),
                    }),
                  });
                }
              });
          }
          ConfMessageEvent.removeEventListener(evtId, confirmDelete);
        };
        ConfMessageEvent.addEventListener(evtId, confirmDelete);
      }
    );
  }, [
    api,
    setConfirmContent,
    t,
    tipTextData?.tipText.title,
    ConfMessageEvent,
    id,
    getNewId,
    createAlert,
    reloadTipTexts,
    navigate,
    setError,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.tipTexts
        .get({ tipTextId: id })
        .then((curatedTipText: ICuratedTipText) => {
          const { tipText, i18n } = curatedTipText;
          setTipTextData(curatedTipText);
          setTipTextText(tipText.summary);
          if (i18n.fr !== undefined) {
            setTipTextTextFr(i18n.fr.summary ?? '');
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
            ),
          });
        });
    }
  }, [api, createAlert, getNewId, id, t]);

  // The Autosave
  useEffect(() => {
    saveTimer.current = setInterval(() => {
      silentSave.current = true;
      handleSubmit(onSaveTipText)().then(
        () => {},
        () => {}
      );
    }, 600000);
    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveTipText]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(tipTextData));
  }, [tipTextData, reset, createDefaultData]);

  return (
    <div
      className={classTrim(`
        adminEditTipText
        ${displayInt ? 'adminEditTipText--int-visible' : ''}
      `)}
    >
      <form onSubmit={handleSubmit(onSaveTipText)} noValidate className="adminEditTipText__content">
        <div className="adminEditTipText__head">
          <Atitle level={1}>{tipTextData?.tipText.title}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditTipText.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Atitle level={2}>{t('adminEditTipText.edit', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror className="adminEditTipText__error">{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditTipText__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameTipText.required', { ns: 'fields' }) }}
            label={t('nameTipText.label', { ns: 'fields' })}
            className="adminEditTipText__basics__name"
          />
        </div>
        <div className="adminEditTipText__details">
          <RichTextElement
            label={t('tipTextSummary.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={tipTextText}
            small
          />
          <Input
            control={control}
            inputName="tipId"
            type="text"
            rules={{
              required: t('tipTextFormula.required', { ns: 'fields' }),
              pattern: {
                value: /^([a-z]){2,3}$/,
                message: t('tipTextFormula.format', { ns: 'fields' }),
              },
            }}
            label={t('tipTextFormula.label', { ns: 'fields' })}
          />
        </div>
        <div className="adminEditTipText__intl-title">
          <div className="adminEditTipText__intl-title__content">
            <Atitle className="adminEditTipText__intl-title__title" level={2}>
              {t('adminEditTipText.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditTipText__intl-title__info">
              {t('adminEditTipText.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt((prev) => !prev);
            }}
            className="adminEditTipText__intl-title__btn"
          />
        </div>
        <div className="adminEditTipText__intl">
          <div className="adminEditTipText__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameTipText.label', { ns: 'fields' })} (FR)`}
              className="adminEditTipText__basics__name"
            />
          </div>
          <div className="adminEditTipText__details">
            <RichTextElement
              label={`${t('tipTextSummary.title', { ns: 'fields' })} (FR)`}
              editor={textFrEditor ?? undefined}
              rawStringContent={tipTextTextFr}
              small
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditTipText.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditTipText;
