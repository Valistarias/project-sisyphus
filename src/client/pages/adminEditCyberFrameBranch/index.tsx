import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useSystemAlerts } from '../../providers';

import { Aa, Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';
import { type ICuratedCyberFrameBranch, type ICuratedNode } from '../../types';

import './adminEditCyberFrameBranch.scss';

interface FormValues {
  name: string;
  nameFr: string;
}

const AdminEditCyberFrameBranch: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage?.() ?? {
    setConfirmContent: () => {},
    ConfMessageEvent: {},
  };
  const { id } = useParams();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [cyberFrameBranchData, setCyberFrameBranchData] = useState<ICuratedCyberFrameBranch | null>(
    null
  );

  const [nodes, setNodes] = useState<ICuratedNode[] | null>(null);

  const [cyberFrameBranchText, setCyberFrameBranchText] = useState('');
  const [cyberFrameBranchTextFr, setCyberFrameBranchTextFr] = useState('');

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const textFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const createDefaultData = useCallback((cyberFrameBranchData: ICuratedCyberFrameBranch | null) => {
    if (cyberFrameBranchData == null) {
      return {};
    }
    const { cyberFrameBranch, i18n } = cyberFrameBranchData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = cyberFrameBranch.title;
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
    defaultValues: useMemo(
      () => createDefaultData(cyberFrameBranchData),
      [createDefaultData, cyberFrameBranchData]
    ),
  });

  const onSaveCyberFrameBranch: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr }) => {
      if (
        cyberFrameBranchText === null ||
        cyberFrameBranchTextFr === null ||
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

      api.cyberFrameBranches
        .update({
          id,
          title: name,
          summary: htmlText,
          i18n,
        })
        .then((cyberFrameBranch) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditCyberFrameBranch.successUpdate', { ns: 'pages' })}</Ap>
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
                field: i18next.format(t(`terms.cyberFrameBranchType.${data.sent}`), 'capitalize'),
              }),
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.cyberFrameBranchType.${data.sent}`), 'capitalize'),
              }),
            });
          }
        });
    },
    [
      cyberFrameBranchText,
      cyberFrameBranchTextFr,
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
        title: t('adminEditCyberFrameBranch.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditCyberFrameBranch.confirmDeletion.text', {
          ns: 'pages',
          elt: cyberFrameBranchData?.cyberFrameBranch.title,
        }),
        confirmCta: t('adminEditCyberFrameBranch.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.cyberFrameBranches
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditCyberFrameBranch.successDelete', { ns: 'pages' })}</Ap>
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
                      field: i18next.format(t(`terms.cyberFrameBranch.name`), 'capitalize'),
                    }),
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.cyberFrameBranch.name`), 'capitalize'),
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
    cyberFrameBranchData?.cyberFrameBranch.title,
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
      api.cyberFrameBranches
        .get({ cyberFrameBranchId: id })
        .then((curatedCyberFrameBranch: ICuratedCyberFrameBranch) => {
          const { cyberFrameBranch, i18n } = curatedCyberFrameBranch;
          setCyberFrameBranchData(curatedCyberFrameBranch);
          setCyberFrameBranchText(cyberFrameBranch.summary);
          if (i18n.fr !== undefined) {
            setCyberFrameBranchTextFr(i18n.fr.text ?? '');
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

      api.nodes
        .getAllByBranch({ cyberFrameBranchId: id })
        .then((curatedNodes: ICuratedNode[]) => {
          setNodes(curatedNodes ?? []);
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
      handleSubmit(onSaveCyberFrameBranch)().then(
        () => {},
        () => {}
      );
    }, 300000);
    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveCyberFrameBranch]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(cyberFrameBranchData));
  }, [cyberFrameBranchData, reset, createDefaultData]);

  return (
    <div className="adminEditCyberFrameBranch">
      <form
        onSubmit={handleSubmit(onSaveCyberFrameBranch)}
        noValidate
        className="adminEditCyberFrameBranch__content"
      >
        <div className="adminEditCyberFrameBranch__head">
          <Atitle level={1}>{t('adminEditCyberFrameBranch.title', { ns: 'pages' })}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditCyberFrameBranch.delete', { ns: 'pages' })}
          </Button>
        </div>
        <div className="adminEditCyberFrameBranch__ariane">
          <Ap className="adminEditCyberFrameBranch__ariane__elt">
            {`${t(`terms.cyberFrame.name`)}: `}
            <Aa
              href={`/admin/cyberframe/${cyberFrameBranchData?.cyberFrameBranch.cyberFrame?._id}`}
            >
              {cyberFrameBranchData?.cyberFrameBranch.cyberFrame.title as string}
            </Aa>
          </Ap>
        </div>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror className="adminEditCyberFrameBranch__error">
            {errors.root.serverError.message}
          </Aerror>
        ) : null}
        <div className="adminEditCyberFrameBranch__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameCyberFrameBranch.required', { ns: 'fields' }) }}
            label={t('nameCyberFrameBranch.label', { ns: 'fields' })}
            className="adminEditCyberFrameBranch__basics__name"
          />
        </div>
        <div className="adminEditCyberFrameBranch__details">
          <RichTextElement
            label={t('cyberFrameBranchSummary.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={cyberFrameBranchText}
            small
          />
        </div>

        <Atitle className="adminEditCyberFrameBranch__intl" level={2}>
          {t('adminEditCyberFrameBranch.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminEditCyberFrameBranch__intl-info">
          {t('adminEditCyberFrameBranch.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminEditCyberFrameBranch__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameCyberFrameBranch.label', { ns: 'fields' })} (FR)`}
            className="adminEditCyberFrameBranch__basics__name"
          />
        </div>
        <div className="adminEditCyberFrameBranch__details">
          <RichTextElement
            label={`${t('cyberFrameBranchSummary.title', { ns: 'fields' })} (FR)`}
            editor={textFrEditor ?? undefined}
            rawStringContent={cyberFrameBranchTextFr}
            small
          />
        </div>
        <Button type="submit">{t('adminEditCyberFrameBranch.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditCyberFrameBranch;
