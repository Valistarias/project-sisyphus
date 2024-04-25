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
import { type ICuratedCharParam } from '../../../types';

import './adminEditCharParam.scss';

interface FormValues {
  name: string;
  short: string;
  nameFr: string;
  shortFr: string;
  formulaId: string;
}

const AdminEditCharParam: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { reloadCharParams } = useGlobalVars();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage?.() ?? {
    setConfirmContent: () => {},
    ConfMessageEvent: {},
  };
  const { id } = useParams();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [charParamData, setCharParamData] = useState<ICuratedCharParam | null>(null);

  const [charParamText, setCharParamText] = useState('');
  const [charParamTextFr, setCharParamTextFr] = useState('');

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const textFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const createDefaultData = useCallback((charParamData: ICuratedCharParam | null) => {
    if (charParamData == null) {
      return {};
    }
    const { charParam, i18n } = charParamData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = charParam.title;
    defaultData.short = charParam.short;
    defaultData.formulaId = charParam.formulaId;
    if (i18n.fr !== undefined) {
      defaultData.nameFr = i18n.fr.title ?? '';
      defaultData.shortFr = i18n.fr.short ?? '';
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
    defaultValues: useMemo(
      () => createDefaultData(charParamData),
      [createDefaultData, charParamData]
    ),
  });

  const onSaveCharParam: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, short, shortFr, formulaId }) => {
      if (
        charParamText === null ||
        charParamTextFr === null ||
        textEditor === null ||
        textFrEditor === null ||
        formulaId === null ||
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
            short: shortFr ?? '',
            text: htmlTextFr,
          },
        };
      }

      api.charParams
        .update({
          id,
          title: name,
          short,
          formulaId,
          summary: htmlText,
          i18n,
        })
        .then((charParam) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditCharParam.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadCharParams();
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
      charParamText,
      charParamTextFr,
      textEditor,
      textFrEditor,
      api,
      id,
      getNewId,
      createAlert,
      t,
      reloadCharParams,
      setError,
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditCharParam.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditCharParam.confirmDeletion.text', {
          ns: 'pages',
          elt: charParamData?.charParam.title,
        }),
        confirmCta: t('adminEditCharParam.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.charParams
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditCharParam.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                reloadCharParams();
                navigate('/admin/charparams');
              })
              .catch(({ response }) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.charParam.name`), 'capitalize'),
                    }),
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.charParam.name`), 'capitalize'),
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
    charParamData?.charParam.title,
    ConfMessageEvent,
    id,
    getNewId,
    createAlert,
    reloadCharParams,
    navigate,
    setError,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.charParams
        .get({ charParamId: id })
        .then((curatedCharParam: ICuratedCharParam) => {
          const { charParam, i18n } = curatedCharParam;
          setCharParamData(curatedCharParam);
          setCharParamText(charParam.summary);
          if (i18n.fr !== undefined) {
            setCharParamTextFr(i18n.fr.text ?? '');
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
      handleSubmit(onSaveCharParam)().then(
        () => {},
        () => {}
      );
    }, 600000);
    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveCharParam]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(charParamData));
  }, [charParamData, reset, createDefaultData]);

  return (
    <div className="adminEditCharParam">
      <form
        onSubmit={handleSubmit(onSaveCharParam)}
        noValidate
        className="adminEditCharParam__content"
      >
        <div className="adminEditCharParam__head">
          <Atitle level={1}>{t('adminEditCharParam.title', { ns: 'pages' })}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditCharParam.delete', { ns: 'pages' })}
          </Button>
        </div>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror className="adminEditCharParam__error">{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditCharParam__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameCharParam.required', { ns: 'fields' }) }}
            label={t('nameCharParam.label', { ns: 'fields' })}
            className="adminEditCharParam__basics__name"
          />
          <Input
            control={control}
            inputName="short"
            type="text"
            rules={{
              required: t('nameCharParamShort.required', { ns: 'fields' }),
            }}
            label={t('nameCharParamShort.label', { ns: 'fields' })}
            className="adminNewCharParam__basics__name"
          />
        </div>
        <div className="adminEditCharParam__details">
          <RichTextElement
            label={t('charParamText.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={charParamText}
            small
          />
          <Input
            control={control}
            inputName="formulaId"
            type="text"
            rules={{
              required: t('charParamFormula.required', { ns: 'fields' }),
              pattern: {
                value: /^([a-z]){3}$/,
                message: t('charParamFormula.format', { ns: 'fields' }),
              },
            }}
            label={t('charParamFormula.label', { ns: 'fields' })}
          />
        </div>

        <Atitle className="adminEditCharParam__intl" level={2}>
          {t('adminEditCharParam.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminEditCharParam__intl-info">
          {t('adminEditCharParam.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminEditCharParam__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameCharParam.label', { ns: 'fields' })} (FR)`}
            className="adminEditCharParam__basics__name"
          />
          <Input
            control={control}
            inputName="shortFr"
            type="text"
            label={`${t('nameCharParamShort.label', { ns: 'fields' })} (FR)`}
            className="adminNewCharParam__basics__name"
          />
        </div>
        <div className="adminEditCharParam__details">
          <RichTextElement
            label={`${t('charParamText.title', { ns: 'fields' })} (FR)`}
            editor={textFrEditor ?? undefined}
            rawStringContent={charParamTextFr}
            small
          />
        </div>
        <Button type="submit">{t('adminEditCharParam.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditCharParam;
