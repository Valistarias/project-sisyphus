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

import type { ICuratedProgramScope } from '../../../types';

import { classTrim } from '../../../utils';

import './adminEditProgramScope.scss';

interface FormValues {
  name: string
  nameFr: string
  scopeId: string
}

const AdminEditProgramScope: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { reloadProgramScopes } = useGlobalVars();
  const confMessageEvt = useConfirmMessage();
  const { id } = useParams();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [displayInt, setDisplayInt] = useState(false);

  const [programScopeData, setProgramScopeData] = useState<ICuratedProgramScope | null>(null);

  const [programScopeText, setProgramScopeText] = useState('');
  const [programScopeTextFr, setProgramScopeTextFr] = useState('');

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const textFrEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const createDefaultData = useCallback((programScopeData: ICuratedProgramScope | null) => {
    if (programScopeData == null) {
      return {};
    }
    const { programScope, i18n } = programScopeData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = programScope.title;
    defaultData.scopeId = programScope.scopeId;
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
    reset
  } = useForm({
    defaultValues: useMemo(
      () => createDefaultData(programScopeData),
      [createDefaultData, programScopeData]
    )
  });

  const onSaveProgramScope: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, scopeId }) => {
      if (
        programScopeText === null
        || programScopeTextFr === null
        || textEditor === null
        || textFrEditor === null
        || scopeId === null
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

      api.programScopes
        .update({
          id,
          title: name,
          summary: htmlText,
          scopeId,
          i18n
        })
        .then((programScope) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditProgramScope.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          reloadProgramScopes();
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: `${t(`serverErrors.${data.code}`, {
                field: 'Formula Id'
              })} by ${data.sent}`
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.charparamsType.${data.sent}`), 'capitalize')
              })
            });
          }
        });
    },
    [
      programScopeText,
      programScopeTextFr,
      textEditor,
      textFrEditor,
      api,
      id,
      getNewId,
      createAlert,
      t,
      reloadProgramScopes,
      setError
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || confMessageEvt === null) {
      return;
    }
    confMessageEvt.setConfirmContent(
      {
        title: t('adminEditProgramScope.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditProgramScope.confirmDeletion.text', {
          ns: 'pages',
          elt: programScopeData?.programScope.title
        }),
        confirmCta: t('adminEditProgramScope.confirmDeletion.confirmCta', { ns: 'pages' })
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.programScopes
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditProgramScope.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  )
                });
                reloadProgramScopes();
                void navigate('/admin/programscopes');
              })
              .catch(({ response }) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.programScope.name`), 'capitalize')
                    })
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.programScope.name`), 'capitalize')
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
  }, [api, confMessageEvt, t, programScopeData?.programScope.title, id, getNewId, createAlert, reloadProgramScopes, navigate, setError]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.programScopes
        .get({ programScopeId: id })
        .then((curatedProgramScope: ICuratedProgramScope) => {
          const { programScope, i18n } = curatedProgramScope;
          setProgramScopeData(curatedProgramScope);
          setProgramScopeText(programScope.summary);
          if (i18n.fr !== undefined) {
            setProgramScopeTextFr(i18n.fr.summary ?? '');
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
  }, [api, createAlert, getNewId, id, t]);

  // The Autosave
  useEffect(() => {
    saveTimer.current = setInterval(() => {
      silentSave.current = true;
      handleSubmit(onSaveProgramScope)().then(
        () => {},
        () => {}
      );
    }, 600000);

    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveProgramScope]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(programScopeData));
  }, [programScopeData, reset, createDefaultData]);

  return (
    <div
      className={classTrim(`
        adminEditProgramScope
        ${displayInt ? 'adminEditProgramScope--int-visible' : ''}
      `)}
    >
      <form
        onSubmit={handleSubmit(onSaveProgramScope)}
        noValidate
        className="adminEditProgramScope__content"
      >
        <div className="adminEditProgramScope__head">
          <Atitle level={1}>{programScopeData?.programScope.title}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditProgramScope.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Atitle level={2}>{t('adminEditProgramScope.edit', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror className="adminEditProgramScope__error">
                {errors.root.serverError.message}
              </Aerror>
            )
          : null}
        <div className="adminEditProgramScope__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameProgramScope.required', { ns: 'fields' }) }}
            label={t('nameProgramScope.label', { ns: 'fields' })}
            className="adminEditProgramScope__basics__name"
          />
        </div>
        <div className="adminEditProgramScope__details">
          <RichTextElement
            label={t('programScopeSummary.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={programScopeText}
            small
          />
          <Input
            control={control}
            inputName="scopeId"
            type="text"
            rules={{
              required: t('programScopeFormula.required', { ns: 'fields' }),
              pattern: {
                value: /^([a-z]){2,3}$/,
                message: t('programScopeFormula.format', { ns: 'fields' })
              }
            }}
            label={t('programScopeFormula.label', { ns: 'fields' })}
          />
        </div>
        <div className="adminEditProgramScope__intl-title">
          <div className="adminEditProgramScope__intl-title__content">
            <Atitle className="adminEditProgramScope__intl-title__title" level={2}>
              {t('adminEditProgramScope.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditProgramScope__intl-title__info">
              {t('adminEditProgramScope.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt(prev => !prev);
            }}
            className="adminEditProgramScope__intl-title__btn"
          />
        </div>
        <div className="adminEditProgramScope__intl">
          <div className="adminEditProgramScope__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameProgramScope.label', { ns: 'fields' })} (FR)`}
              className="adminEditProgramScope__basics__name"
            />
          </div>
          <div className="adminEditProgramScope__details">
            <RichTextElement
              label={`${t('programScopeSummary.title', { ns: 'fields' })} (FR)`}
              editor={textFrEditor ?? undefined}
              rawStringContent={programScopeTextFr}
              small
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditProgramScope.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditProgramScope;
