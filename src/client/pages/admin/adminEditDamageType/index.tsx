import React, {
  useCallback, useEffect, useMemo, useRef, useState, type FC
} from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import {
  useForm, type FieldValues, type SubmitHandler
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

import type { ICuratedDamageType } from '../../../types';

import { classTrim } from '../../../utils';

import './adminEditDamageType.scss';

interface FormValues {
  name: string
  nameFr: string
}

const AdminEditDamageType: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const { reloadDamageTypes } = useGlobalVars();
  const confMessageEvt = useConfirmMessage();
  const { id } = useParams();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [displayInt, setDisplayInt] = useState(false);

  const [damageTypeData, setDamageTypeData] = useState<ICuratedDamageType | null>(null);

  const [damageTypeText, setDamageTypeText] = useState('');
  const [damageTypeTextFr, setDamageTypeTextFr] = useState('');

  const textEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const textFrEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const createDefaultData = useCallback((damageTypeData: ICuratedDamageType | null) => {
    if (damageTypeData == null) {
      return {};
    }
    const {
      damageType, i18n
    } = damageTypeData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = damageType.title;
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
    () => createDefaultData(damageTypeData),
    [createDefaultData, damageTypeData]
  ) });

  const onSaveDamageType: SubmitHandler<FormValues> = useCallback(
    ({
      name, nameFr
    }) => {
      if (
        damageTypeText === null
        || damageTypeTextFr === null
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
        i18n = { fr: {
          title: nameFr,
          text: htmlTextFr
        } };
      }

      api.damageTypes
        .update({
          id,
          title: name,
          summary: htmlText,
          i18n
        })
        .then((damageType) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditDamageType.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          reloadDamageTypes();
        })
        .catch(({ response }) => {
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
      damageTypeText,
      damageTypeTextFr,
      textEditor,
      textFrEditor,
      api,
      id,
      getNewId,
      createAlert,
      t,
      reloadDamageTypes,
      setError
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || confMessageEvt === null) {
      return;
    }
    confMessageEvt.setConfirmContent(
      {
        title: t('adminEditDamageType.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditDamageType.confirmDeletion.text', {
          ns: 'pages',
          elt: damageTypeData?.damageType.title
        }),
        confirmCta: t('adminEditDamageType.confirmDeletion.confirmCta', { ns: 'pages' })
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.damageTypes
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditDamageType.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  )
                });
                reloadDamageTypes();
                void navigate('/admin/damagetypes');
              })
              .catch(({ response }) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.damageType.name`), 'capitalize') })
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.damageType.name`), 'capitalize') })
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
    damageTypeData?.damageType.title,
    id,
    getNewId,
    createAlert,
    reloadDamageTypes,
    navigate,
    setError
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.damageTypes
        .get({ damageTypeId: id })
        .then((curatedDamageType: ICuratedDamageType) => {
          const {
            damageType, i18n
          } = curatedDamageType;
          setDamageTypeData(curatedDamageType);
          setDamageTypeText(damageType.summary);
          if (i18n.fr !== undefined) {
            setDamageTypeTextFr(i18n.fr.summary ?? '');
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
      handleSubmit(onSaveDamageType)().then(
        () => {},
        () => {}
      );
    }, 600000);

    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveDamageType]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(damageTypeData));
  }, [
    damageTypeData,
    reset,
    createDefaultData
  ]);

  return (
    <div
      className={classTrim(`
        adminEditDamageType
        ${displayInt ? 'adminEditDamageType--int-visible' : ''}
      `)}
    >
      <form
        onSubmit={handleSubmit(onSaveDamageType)}
        noValidate
        className="adminEditDamageType__content"
      >
        <div className="adminEditDamageType__head">
          <Atitle level={1}>{damageTypeData?.damageType.title}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditDamageType.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Button className="adminEditDamageType__return-btn" href="/admin/damagetypes" size="small">
          {t('adminEditDamageType.return', { ns: 'pages' })}
        </Button>
        <Atitle level={2}>{t('adminEditDamageType.edit', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror className="adminEditDamageType__error">{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminEditDamageType__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameDamageType.required', { ns: 'fields' }) }}
            label={t('nameDamageType.label', { ns: 'fields' })}
            className="adminEditDamageType__basics__name"
          />
        </div>
        <div className="adminEditDamageType__details">
          <RichTextElement
            label={t('damageTypeSummary.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={damageTypeText}
            small
          />
        </div>
        <div className="adminEditDamageType__intl-title">
          <div className="adminEditDamageType__intl-title__content">
            <Atitle className="adminEditDamageType__intl-title__title" level={2}>
              {t('adminEditDamageType.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditDamageType__intl-title__info">
              {t('adminEditDamageType.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt(prev => !prev);
            }}
            className="adminEditDamageType__intl-title__btn"
          />
        </div>
        <div className="adminEditDamageType__intl">
          <div className="adminEditDamageType__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameDamageType.label', { ns: 'fields' })} (FR)`}
              className="adminEditDamageType__basics__name"
            />
          </div>
          <div className="adminEditDamageType__details">
            <RichTextElement
              label={`${t('damageTypeSummary.title', { ns: 'fields' })} (FR)`}
              editor={textFrEditor ?? undefined}
              rawStringContent={damageTypeTextFr}
              small
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditDamageType.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditDamageType;
