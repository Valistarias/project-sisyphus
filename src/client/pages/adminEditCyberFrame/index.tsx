import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useGlobalVars, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input, SmartSelect, type ISingleValueSelect } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';
import { type ICuratedCyberFrame } from '../../types';

import './adminEditCyberFrame.scss';

interface FormValues {
  name: string;
  nameFr: string;
  ruleBook: string;
}

const AdminEditCyberFrame: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage?.() ?? {
    setConfirmContent: () => {},
    ConfMessageEvent: {},
  };
  const { id } = useParams();
  const { ruleBooks } = useGlobalVars();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [cyberFrameData, setCyberFrameData] = useState<ICuratedCyberFrame | null>(null);

  const [cyberFrameText, setCyberFrameText] = useState('');
  const [cyberFrameTextFr, setCyberFrameTextFr] = useState('');

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const textFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const ruleBookSelect = useMemo(() => {
    return ruleBooks.map(({ ruleBook }) => ({
      value: ruleBook._id,
      // TODO : Handle Internationalization
      label: ruleBook.title,
      details: t(`ruleBookTypeNames.${ruleBook.type.name}`, { count: 1 }),
    }));
  }, [t, ruleBooks]);

  const createDefaultData = useCallback(
    (cyberFrameData: ICuratedCyberFrame | null, ruleBookSelect: ISingleValueSelect[]) => {
      if (cyberFrameData == null) {
        return {};
      }
      const { cyberFrame, i18n } = cyberFrameData;
      const defaultData: Partial<FormValues> = {};
      defaultData.name = cyberFrame.title;
      const selectedfield = ruleBookSelect.find(
        (singleSelect) => singleSelect.value === cyberFrame.ruleBook?._id
      );
      if (selectedfield !== undefined) {
        defaultData.ruleBook = selectedfield.value;
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
  } = useForm<FieldValues>({
    defaultValues: useMemo(
      () => createDefaultData(cyberFrameData, ruleBookSelect),
      [createDefaultData, cyberFrameData, ruleBookSelect]
    ),
  });

  const ruleBook = useMemo(() => cyberFrameData?.cyberFrame.ruleBook, [cyberFrameData]);

  const onSaveCyberFrame: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, ruleBook }) => {
      if (
        cyberFrameText === null ||
        cyberFrameTextFr === null ||
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
        })
        .then((cyberFrame) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditCyberFrame.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
        })
        .catch(({ response }) => {
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
    [
      cyberFrameText,
      cyberFrameTextFr,
      textEditor,
      textFrEditor,
      api,
      id,
      getNewId,
      createAlert,
      t,
      setError,
    ]
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
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
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
                navigate('/admin/cyberframes');
              })
              .catch(({ response }) => {
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
          ConfMessageEvent.removeEventListener(evtId, confirmDelete);
        };
        ConfMessageEvent.addEventListener(evtId, confirmDelete);
      }
    );
  }, [
    api,
    setConfirmContent,
    t,
    cyberFrameData?.cyberFrame.title,
    ConfMessageEvent,
    id,
    getNewId,
    createAlert,
    navigate,
    setError,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.cyberFrames
        .get({ cyberFrameId: id })
        .then((curatedCyberFrame: ICuratedCyberFrame) => {
          const { cyberFrame, i18n } = curatedCyberFrame;
          setCyberFrameData(curatedCyberFrame);
          setCyberFrameText(cyberFrame.summary);
          if (i18n.fr !== undefined) {
            setCyberFrameTextFr(i18n.fr.text ?? '');
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
  }, [api, createAlert, getNewId, ruleBooks, id, t]);

  // The Autosave
  useEffect(() => {
    saveTimer.current = setInterval(() => {
      silentSave.current = true;
      handleSubmit(onSaveCyberFrame)().then(
        () => {},
        () => {}
      );
    }, 300000);
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
    <div className="adminEditCyberFrame">
      <form
        onSubmit={handleSubmit(onSaveCyberFrame)}
        noValidate
        className="adminEditCyberFrame__content"
      >
        <div className="adminEditCyberFrame__head">
          <Atitle level={1}>{t('adminEditCyberFrame.title', { ns: 'pages' })}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditCyberFrame.delete', { ns: 'pages' })}
          </Button>
        </div>
        {errors.root?.serverError?.message !== undefined ? (
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
            label={t('cyberFrameRuleBookType.title', { ns: 'fields' })}
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

        <Atitle className="adminEditCyberFrame__intl" level={2}>
          {t('adminEditCyberFrame.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminEditCyberFrame__intl-info">
          {t('adminEditCyberFrame.i18nInfo', { ns: 'pages' })}
        </Ap>
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
        <Button type="submit">{t('adminEditCyberFrame.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditCyberFrame;
