import React, {
  useCallback, useEffect, useMemo, useRef, useState, type FC
} from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import {
  useForm, type SubmitHandler
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useNavigate, useParams
} from 'react-router-dom';

import {
  useApi, useConfirmMessage, useGlobalVars, useSystemAlerts
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

import type { ICuratedWeaponScope } from '../../../types';

import { classTrim } from '../../../utils';

import './adminEditWeaponScope.scss';

interface FormValues {
  name: string
  nameFr: string
  scopeId: string
}

const AdminEditWeaponScope: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const { reloadWeaponScopes } = useGlobalVars();
  const confMessageEvt = useConfirmMessage();
  const { id } = useParams();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [displayInt, setDisplayInt] = useState(false);

  const [weaponScopeData, setWeaponScopeData] = useState<ICuratedWeaponScope | null>(null);

  const [weaponScopeText, setWeaponScopeText] = useState('');
  const [weaponScopeTextFr, setWeaponScopeTextFr] = useState('');

  const textEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const textFrEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const createDefaultData = useCallback((weaponScopeData: ICuratedWeaponScope | null) => {
    if (weaponScopeData == null) {
      return {};
    }
    const {
      weaponScope, i18n
    } = weaponScopeData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = weaponScope.title;
    defaultData.scopeId = weaponScope.scopeId;
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
  } = useForm({ defaultValues: useMemo(
    () => createDefaultData(weaponScopeData),
    [createDefaultData, weaponScopeData]
  ) });

  const onSaveWeaponScope: SubmitHandler<FormValues> = useCallback(
    ({
      name, nameFr, scopeId
    }) => {
      if (
        weaponScopeText === null
        || weaponScopeTextFr === null
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

      let i18n: InternationalizationType | null = null;

      if (nameFr !== '' || htmlTextFr !== '<p class="ap"></p>') {
        i18n = { fr: {
          title: nameFr,
          text: htmlTextFr
        } };
      }

      api.weaponScopes
        .update({
          id,
          title: name,
          summary: htmlText,
          scopeId,
          i18n
        })
        .then((weaponScope) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditWeaponScope.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          reloadWeaponScopes();
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: `${t(`serverErrors.${data.code}`, { field: 'Formula Id' })} by ${data.sent}`
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.charparamsType.${data.sent}`), 'capitalize') })
            });
          }
        });
    },
    [
      weaponScopeText,
      weaponScopeTextFr,
      textEditor,
      textFrEditor,
      api,
      id,
      getNewId,
      createAlert,
      t,
      reloadWeaponScopes,
      setError
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || confMessageEvt === null) {
      return;
    }
    confMessageEvt.setConfirmContent(
      {
        title: t('adminEditWeaponScope.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditWeaponScope.confirmDeletion.text', {
          ns: 'pages',
          elt: weaponScopeData?.weaponScope.title
        }),
        confirmCta: t('adminEditWeaponScope.confirmDeletion.confirmCta', { ns: 'pages' })
      },
      (evtId: string) => {
        const confirmDelete = (
            { detail }: { detail: ConfirmMessageDetailData }
          ): void => {
            if (detail.proceed) {
            api.weaponScopes
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditWeaponScope.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  )
                });
                reloadWeaponScopes();
                void navigate('/admin/weaponscopes');
              })
              .catch(({ response }: ErrorResponseType) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.weaponScope.name`), 'capitalize') })
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.weaponScope.name`), 'capitalize') })
                  });
                }
              });
          }
          confMessageEvt.removeConfirmEventListener(evtId, confirmDelete);
        };
        confMessageEvt.addConfirmEventListener(evtId, confirmDelete);
      }
    );
  }, [
    api,
    confMessageEvt,
    t,
    weaponScopeData?.weaponScope.title,
    id,
    getNewId,
    createAlert,
    reloadWeaponScopes,
    navigate,
    setError
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.weaponScopes
        .get({ weaponScopeId: id })
        .then((curatedWeaponScope) => {
          const {
            weaponScope, i18n
          } = curatedWeaponScope;
          setWeaponScopeData(curatedWeaponScope);
          setWeaponScopeText(weaponScope.summary);
          if (i18n.fr !== undefined) {
            setWeaponScopeTextFr(i18n.fr.summary ?? '');
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
  }, [
    api,
    createAlert,
    getNewId,
    id,
    t
  ]);

  // The Autosave
  useEffect(() => {
    saveTimer.current = setInterval(() => {
      silentSave.current = true;
      handleSubmit(onSaveWeaponScope)().then(
        () => {},
        () => {}
      );
    }, 600000);

    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveWeaponScope]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(weaponScopeData));
  }, [
    weaponScopeData,
    reset,
    createDefaultData
  ]);

  return (
    <div
      className={classTrim(`
        adminEditWeaponScope
        ${displayInt ? 'adminEditWeaponScope--int-visible' : ''}
      `)}
    >
      <form
        onSubmit={() => handleSubmit(onSaveWeaponScope)}
        noValidate
        className="adminEditWeaponScope__content"
      >
        <div className="adminEditWeaponScope__head">
          <Atitle level={1}>{weaponScopeData?.weaponScope.title}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditWeaponScope.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Button
          className="adminEditWeaponScope__return-btn"
          href="/admin/weaponscopes"
          size="small"
        >
          {t('adminEditWeaponScope.return', { ns: 'pages' })}
        </Button>
        <Atitle level={2}>{t('adminEditWeaponScope.edit', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror className="adminEditWeaponScope__error">{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminEditWeaponScope__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameWeaponScope.required', { ns: 'fields' }) }}
            label={t('nameWeaponScope.label', { ns: 'fields' })}
            className="adminEditWeaponScope__basics__name"
          />
        </div>
        <div className="adminEditWeaponScope__details">
          <RichTextElement
            label={t('weaponScopeSummary.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={weaponScopeText}
            small
          />
          <Input
            control={control}
            inputName="scopeId"
            type="text"
            rules={{
              required: t('weaponScopeFormula.required', { ns: 'fields' }),
              pattern: {
                value: /^([a-z]){2,3}$/,
                message: t('weaponScopeFormula.format', { ns: 'fields' })
              }
            }}
            label={t('weaponScopeFormula.label', { ns: 'fields' })}
          />
        </div>
        <div className="adminEditWeaponScope__intl-title">
          <div className="adminEditWeaponScope__intl-title__content">
            <Atitle className="adminEditWeaponScope__intl-title__title" level={2}>
              {t('adminEditWeaponScope.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditWeaponScope__intl-title__info">
              {t('adminEditWeaponScope.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt(prev => !prev);
            }}
            className="adminEditWeaponScope__intl-title__btn"
          />
        </div>
        <div className="adminEditWeaponScope__intl">
          <div className="adminEditWeaponScope__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameWeaponScope.label', { ns: 'fields' })} (FR)`}
              className="adminEditWeaponScope__basics__name"
            />
          </div>
          <div className="adminEditWeaponScope__details">
            <RichTextElement
              label={`${t('weaponScopeSummary.title', { ns: 'fields' })} (FR)`}
              editor={textFrEditor ?? undefined}
              rawStringContent={weaponScopeTextFr}
              small
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditWeaponScope.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditWeaponScope;
