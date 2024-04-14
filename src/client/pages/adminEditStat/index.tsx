import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useGlobalVars, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';
import { type ICuratedStat } from '../../types';

import './adminEditStat.scss';

interface FormValues {
  name: string;
  short: string;
  nameFr: string;
  shortFr: string;
}

const AdminEditStat: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { reloadStats } = useGlobalVars();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage?.() ?? {
    setConfirmContent: () => {},
    ConfMessageEvent: {},
  };
  const { id } = useParams();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [statData, setStatData] = useState<ICuratedStat | null>(null);

  const [statText, setStatText] = useState('');
  const [statTextFr, setStatTextFr] = useState('');

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const textFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const createDefaultData = useCallback((statData: ICuratedStat | null) => {
    if (statData == null) {
      return {};
    }
    const { stat, i18n } = statData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = stat.title;
    defaultData.short = stat.short;
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
    defaultValues: useMemo(() => createDefaultData(statData), [createDefaultData, statData]),
  });

  const onSaveStat: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, short, shortFr }) => {
      if (
        statText === null ||
        statTextFr === null ||
        textEditor === null ||
        textFrEditor === null ||
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

      api.stats
        .update({
          id,
          title: name,
          short,
          summary: htmlText,
          i18n,
        })
        .then((stat) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditStat.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadStats();
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
    [
      statText,
      statTextFr,
      textEditor,
      textFrEditor,
      api,
      id,
      getNewId,
      createAlert,
      t,
      reloadStats,
      setError,
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditStat.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditStat.confirmDeletion.text', {
          ns: 'pages',
          elt: statData?.stat.title,
        }),
        confirmCta: t('adminEditStat.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.stats
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditStat.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                reloadStats();
                navigate('/admin/stats');
              })
              .catch(({ response }) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.stat.name`), 'capitalize'),
                    }),
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.stat.name`), 'capitalize'),
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
    statData?.stat.title,
    ConfMessageEvent,
    id,
    getNewId,
    createAlert,
    reloadStats,
    navigate,
    setError,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.stats
        .get({ statId: id })
        .then((curatedStat: ICuratedStat) => {
          const { stat, i18n } = curatedStat;
          setStatData(curatedStat);
          setStatText(stat.summary);
          if (i18n.fr !== undefined) {
            setStatTextFr(i18n.fr.text ?? '');
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
      handleSubmit(onSaveStat)().then(
        () => {},
        () => {}
      );
    }, 300000);
    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveStat]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(statData));
  }, [statData, reset, createDefaultData]);

  return (
    <div className="adminEditStat">
      <form onSubmit={handleSubmit(onSaveStat)} noValidate className="adminEditStat__content">
        <div className="adminEditStat__head">
          <Atitle level={1}>{t('adminEditStat.title', { ns: 'pages' })}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditStat.delete', { ns: 'pages' })}
          </Button>
        </div>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror className="adminEditStat__error">{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditStat__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameStat.required', { ns: 'fields' }) }}
            label={t('nameStat.label', { ns: 'fields' })}
            className="adminEditStat__basics__name"
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
        <div className="adminEditStat__details">
          <RichTextElement
            label={t('statText.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={statText}
            small
          />
        </div>

        <Atitle className="adminEditStat__intl" level={2}>
          {t('adminEditStat.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminEditStat__intl-info">{t('adminEditStat.i18nInfo', { ns: 'pages' })}</Ap>
        <div className="adminEditStat__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameStat.label', { ns: 'fields' })} (FR)`}
            className="adminEditStat__basics__name"
          />
          <Input
            control={control}
            inputName="shortFr"
            type="text"
            label={`${t('nameStatShort.label', { ns: 'fields' })} (FR)`}
            className="adminNewStat__basics__name"
          />
        </div>
        <div className="adminEditStat__details">
          <RichTextElement
            label={`${t('statText.title', { ns: 'fields' })} (FR)`}
            editor={textFrEditor ?? undefined}
            rawStringContent={statTextFr}
            small
          />
        </div>
        <Button type="submit">{t('adminEditStat.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditStat;
