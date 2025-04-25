import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import {
  Button,
  Input,
  LinkButton,
  SmartSelect,
  type ISingleValueSelect,
} from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';

import type { ConfirmMessageDetailData } from '../../../providers/confirmMessage';
import type { ErrorResponseType, ICuratedCyberFrame } from '../../../types';
import type { InternationalizationType } from '../../../types/global';

import { classTrim } from '../../../utils';

import './adminEditCyberFrame.scss';

interface FormValues {
  name: string;
  nameFr: string;
  ruleBook: string;
  stats: Record<string, number | undefined>;
  charParams: Record<string, number>;
}

const AdminEditCyberFrame: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { setConfirmContent, removeConfirmEventListener, addConfirmEventListener } =
    useConfirmMessage();
  const { id } = useParams();
  const { ruleBooks, reloadCyberFrames, charParams, stats } = useGlobalVars();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [displayInt, setDisplayInt] = useState(false);

  const [cyberFrameData, setCyberFrameData] = useState<ICuratedCyberFrame | null>(null);

  const [cyberFrameText, setCyberFrameText] = useState('');
  const [cyberFrameTextFr, setCyberFrameTextFr] = useState('');

  const textEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const textFrEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const ruleBookSelect = useMemo(
    () =>
      ruleBooks.map(({ ruleBook }) => ({
        value: ruleBook._id,
        // TODO : Handle Internationalization
        label: ruleBook.title,
        details: t(`ruleBookTypeNames.${ruleBook.type.name}`, { count: 1 }),
      })),
    [t, ruleBooks]
  );

  const createDefaultData = useCallback(
    (cyberFrameData: ICuratedCyberFrame | null, ruleBookSelect: ISingleValueSelect[]) => {
      if (cyberFrameData == null) {
        return {};
      }
      const { cyberFrame, i18n } = cyberFrameData;

      const defaultData: Partial<FormValues> = {};
      defaultData.name = cyberFrame.title;

      defaultData.charParams ??= {};
      defaultData.stats ??= {};

      cyberFrameData.cyberFrame.charParams.forEach((charParam) => {
        defaultData.charParams![`charParam-${charParam.charParam}`] = charParam.value;
      });

      cyberFrameData.cyberFrame.stats.forEach((stat) => {
        defaultData.stats![`stat-${stat.stat}`] = stat.value;
      });

      const selectedfield = ruleBookSelect.find(
        (singleSelect) => singleSelect.value === cyberFrame.ruleBook._id
      );
      if (selectedfield !== undefined) {
        defaultData.ruleBook = String(selectedfield.value);
      }
      if (i18n.fr !== undefined) {
        defaultData.nameFr = i18n.fr.title ?? '';
      }

      return defaultData;
    },
    []
  );

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: useMemo(
      () => createDefaultData(cyberFrameData, ruleBookSelect),
      [createDefaultData, cyberFrameData, ruleBookSelect]
    ),
  });

  const ruleBook = useMemo(() => cyberFrameData?.cyberFrame.ruleBook, [cyberFrameData]);

  const onSaveCyberFrame: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, ruleBook, stats: sentStats, charParams: sentCharParams }) => {
      if (textEditor === null || textFrEditor === null || api === undefined) {
        return;
      }

      const relevantStats: Array<{
        id: string;
        value: number;
      }> = [];
      Object.keys(sentStats).forEach((statId) => {
        if (sentStats[statId] !== undefined && sentStats[statId] > 0) {
          relevantStats.push({
            id: statId.split('-')[1],
            value: sentStats[statId],
          });
        }
      });
      const relevantCharParams: Array<{
        id: string;
        value: number;
      }> = [];
      Object.keys(sentCharParams).forEach((charParamId) => {
        relevantCharParams.push({
          id: charParamId.split('-')[1],
          value: sentCharParams[charParamId],
        });
      });

      let htmlText: string | null = textEditor.getHTML();

      const htmlTextFr = textFrEditor.getHTML();

      if (htmlText === '<p class="ap"></p>') {
        htmlText = null;
      }

      let i18n: InternationalizationType | null = null;

      if (nameFr !== '' || htmlTextFr !== '<p class="ap"></p>') {
        i18n = {
          fr: {
            title: nameFr,
            text: htmlTextFr,
          },
        };
      }

      api.cyberFrames
        .update({
          id,
          title: name,
          ruleBook,
          summary: htmlText,
          i18n,
          stats: relevantStats,
          charParams: relevantCharParams,
        })
        .then(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditCyberFrame.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadCyberFrames();
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.cyberFrameType.${data.sent}`), 'capitalize'),
              }),
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.cyberFrameType.${data.sent}`), 'capitalize'),
              }),
            });
          }
        });
    },
    [textEditor, textFrEditor, api, id, getNewId, createAlert, t, reloadCyberFrames, setError]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditCyberFrame.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditCyberFrame.confirmDeletion.text', {
          ns: 'pages',
          elt: cyberFrameData?.cyberFrame.title,
        }),
        confirmCta: t('adminEditCyberFrame.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }: { detail: ConfirmMessageDetailData }): void => {
          if (detail.proceed) {
            api.cyberFrames
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditCyberFrame.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                reloadCyberFrames();
                void navigate('/admin/cyberframes');
              })
              .catch(({ response }: ErrorResponseType) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.cyberFrame.name`), 'capitalize'),
                    }),
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.cyberFrame.name`), 'capitalize'),
                    }),
                  });
                }
              });
          }
          removeConfirmEventListener(evtId, confirmDelete);
        };
        addConfirmEventListener(evtId, confirmDelete);
      }
    );
  }, [
    api,
    setConfirmContent,
    t,
    cyberFrameData?.cyberFrame.title,
    addConfirmEventListener,
    removeConfirmEventListener,
    id,
    getNewId,
    createAlert,
    reloadCyberFrames,
    navigate,
    setError,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.cyberFrames
        .get({ cyberFrameId: id })
        .then((curatedCyberFrame) => {
          const { cyberFrame, i18n } = curatedCyberFrame;
          setCyberFrameData(curatedCyberFrame);
          setCyberFrameText(cyberFrame.summary);
          if (i18n.fr !== undefined) {
            setCyberFrameTextFr(i18n.fr.summary ?? '');
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
      handleSubmit(onSaveCyberFrame)().then(
        () => undefined,
        () => undefined
      );
    }, 600000);

    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveCyberFrame]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(cyberFrameData, ruleBookSelect));
  }, [cyberFrameData, ruleBookSelect, reset, createDefaultData]);

  return (
    <div
      className={classTrim(`
        adminEditCyberFrame
        ${displayInt ? 'adminEditCyberFrame--int-visible' : ''}
      `)}
    >
      <form
        onSubmit={(evt) => {
          void handleSubmit(onSaveCyberFrame)(evt);
        }}
        noValidate
        className="adminEditCyberFrame__content"
      >
        <div className="adminEditCyberFrame__head">
          <Atitle level={1}>{cyberFrameData?.cyberFrame.title}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditCyberFrame.delete', { ns: 'pages' })}
          </Button>
        </div>
        <LinkButton
          className="adminEditCyberFrame__return-btn"
          href="/admin/cyberframes"
          size="small"
        >
          {t('adminEditCyberFrame.return', { ns: 'pages' })}
        </LinkButton>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror className="adminEditCyberFrame__error">{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditCyberFrame__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameCyberFrame.required', { ns: 'fields' }) }}
            label={t('nameCyberFrame.label', { ns: 'fields' })}
            className="adminEditCyberFrame__basics__name"
          />
          <SmartSelect
            control={control}
            inputName="ruleBook"
            rules={{ required: t('linkedRuleBook.required', { ns: 'fields' }) }}
            label={t('linkedRuleBook.label', { ns: 'fields' })}
            options={ruleBookSelect}
            className="adminEditCyberFrame__basics__type"
          />
        </div>
        <div className="adminEditCyberFrame__details">
          <RichTextElement
            label={t('cyberFrameText.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={cyberFrameText}
            ruleBookId={ruleBook?._id ?? undefined}
            small
            complete
          />
        </div>

        <div className="adminEditCyberFrame__params">
          <div className="adminEditCyberFrame__params__content">
            <Atitle className="adminEditCyberFrame__params__title" level={2}>
              {t('adminEditCyberFrame.charParams', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditCyberFrame__params__info">
              {t('adminEditCyberFrame.charParamsInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <div className="adminEditCyberFrame__params__list">
            {charParams.map((charParam) => (
              <Input
                key={charParam.charParam._id}
                control={control}
                inputName={`charParams.charParam-${charParam.charParam._id}`}
                type="number"
                rules={{ required: t('charParamCyberFrameValue.required', { ns: 'fields' }) }}
                label={charParam.charParam.title}
                className="adminEditCyberFrame__params__list__value"
              />
            ))}
          </div>
        </div>
        <div className="adminEditCyberFrame__stats">
          <div className="adminEditCyberFrame__stats__content">
            <Atitle className="adminEditCyberFrame__stats__title" level={2}>
              {t('adminEditCyberFrame.stats', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditCyberFrame__stats__info">
              {t('adminEditCyberFrame.statsInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <div className="adminEditCyberFrame__stats__list">
            {stats.map((stat) => (
              <Input
                key={stat.stat._id}
                control={control}
                inputName={`stats.stat-${stat.stat._id}`}
                type="number"
                label={stat.stat.title}
                className="adminNewCyberFrame__stats__list__value"
              />
            ))}
          </div>
        </div>
        <div className="adminEditCyberFrame__intl-title">
          <div className="adminEditCyberFrame__intl-title__content">
            <Atitle className="adminEditCyberFrame__intl-title__title" level={2}>
              {t('adminEditCyberFrame.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditCyberFrame__intl-title__info">
              {t('adminEditCyberFrame.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt((prev) => !prev);
            }}
            className="adminEditCyberFrame__intl-title__btn"
          />
        </div>
        <div className="adminEditCyberFrame__intl">
          <div className="adminEditCyberFrame__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameCyberFrame.label', { ns: 'fields' })} (FR)`}
              className="adminEditCyberFrame__basics__name"
            />
          </div>
          <div className="adminEditCyberFrame__details">
            <RichTextElement
              label={`${t('cyberFrameText.title', { ns: 'fields' })} (FR)`}
              editor={textFrEditor ?? undefined}
              rawStringContent={cyberFrameTextFr}
              ruleBookId={ruleBook?._id ?? undefined}
              small
              complete
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditCyberFrame.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditCyberFrame;
