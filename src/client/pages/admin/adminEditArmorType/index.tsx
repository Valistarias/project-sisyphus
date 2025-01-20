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
  Button, Input,
  LinkButton
} from '../../../molecules';
import {
  Alert, RichTextElement, completeRichTextElementExtentions
} from '../../../organisms';

import type { ConfirmMessageDetailData } from '../../../providers/confirmMessage';
import type { ErrorResponseType, ICuratedArmorType } from '../../../types';
import type { InternationalizationType } from '../../../types/global';

import { classTrim } from '../../../utils';

import './adminEditArmorType.scss';

interface FormValues {
  name: string
  nameFr: string
}

const AdminEditArmorType: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const { reloadArmorTypes } = useGlobalVars();
  const {
    setConfirmContent,
    removeConfirmEventListener,
    addConfirmEventListener
  } = useConfirmMessage();
  const { id } = useParams();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [displayInt, setDisplayInt] = useState(false);

  const [armorTypeData, setArmorTypeData]
  = useState<ICuratedArmorType | null>(null);

  const [armorTypeText, setArmorTypeText] = useState('');
  const [armorTypeTextFr, setArmorTypeTextFr] = useState('');

  const textEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const textFrEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const createDefaultData = useCallback(
    (armorTypeData: ICuratedArmorType | null) => {
      if (armorTypeData == null) {
        return {};
      }
      const {
        armorType, i18n
      } = armorTypeData;
      const defaultData: Partial<FormValues> = {};
      defaultData.name = armorType.title;
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
    () => createDefaultData(armorTypeData),
    [createDefaultData, armorTypeData]
  ) });

  const onSaveArmorType: SubmitHandler<FormValues> = useCallback(
    ({
      name, nameFr
    }) => {
      if (
        textEditor === null
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

      let i18n: InternationalizationType | null = null;

      if (nameFr !== '' || htmlTextFr !== '<p class="ap"></p>') {
        i18n = { fr: {
          title: nameFr,
          text: htmlTextFr
        } };
      }

      api.armorTypes
        .update({
          id,
          title: name,
          summary: htmlText,
          i18n
        })
        .then((armorType) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditArmorType.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          reloadArmorTypes();
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
      textEditor,
      textFrEditor,
      api,
      id,
      getNewId,
      createAlert,
      t,
      reloadArmorTypes,
      setError
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditArmorType.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditArmorType.confirmDeletion.text', {
          ns: 'pages',
          elt: armorTypeData?.armorType.title
        }),
        confirmCta: t('adminEditArmorType.confirmDeletion.confirmCta', { ns: 'pages' })
      },
      (evtId: string) => {
        const confirmDelete = (
          { detail }: { detail: ConfirmMessageDetailData }
        ): void => {
          if (detail.proceed) {
            api.armorTypes
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditArmorType.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  )
                });
                reloadArmorTypes();
                void navigate('/admin/armortypes');
              })
              .catch(({ response }: ErrorResponseType) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.armorType.name`), 'capitalize') })
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.armorType.name`), 'capitalize') })
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
    armorTypeData?.armorType.title,
    addConfirmEventListener,
    removeConfirmEventListener,
    id,
    getNewId,
    createAlert,
    reloadArmorTypes,
    navigate,
    setError
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.armorTypes
        .get({ armorTypeId: id })
        .then((curatedArmorType) => {
          const {
            armorType, i18n
          } = curatedArmorType;
          setArmorTypeData(curatedArmorType);
          setArmorTypeText(armorType.summary);
          if (i18n.fr !== undefined) {
            setArmorTypeTextFr(i18n.fr.summary ?? '');
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
      handleSubmit(onSaveArmorType)().then(
        () => undefined,
        () => undefined
      );
    }, 600000);

    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveArmorType]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(armorTypeData));
  }, [
    armorTypeData,
    reset,
    createDefaultData
  ]);

  return (
    <div
      className={classTrim(`
        adminEditArmorType
        ${displayInt ? 'adminEditArmorType--int-visible' : ''}
      `)}
    >
      <form
        onSubmit={(evt) => {
          void handleSubmit(onSaveArmorType)(evt);
        }}
        noValidate
        className="adminEditArmorType__content"
      >
        <div className="adminEditArmorType__head">
          <Atitle level={1}>{armorTypeData?.armorType.title}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditArmorType.delete', { ns: 'pages' })}
          </Button>
        </div>
        <LinkButton className="adminEditArmorType__return-btn" href="/admin/armortypes" size="small">
          {t('adminEditArmorType.return', { ns: 'pages' })}
        </LinkButton>
        <Atitle level={2}>{t('adminEditArmorType.edit', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror className="adminEditArmorType__error">{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminEditArmorType__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameArmorType.required', { ns: 'fields' }) }}
            label={t('nameArmorType.label', { ns: 'fields' })}
            className="adminEditArmorType__basics__name"
          />
        </div>
        <div className="adminEditArmorType__details">
          <RichTextElement
            label={t('armorTypeSummary.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={armorTypeText}
            small
          />
        </div>
        <div className="adminEditArmorType__intl-title">
          <div className="adminEditArmorType__intl-title__content">
            <Atitle className="adminEditArmorType__intl-title__title" level={2}>
              {t('adminEditArmorType.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditArmorType__intl-title__info">
              {t('adminEditArmorType.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt(prev => !prev);
            }}
            className="adminEditArmorType__intl-title__btn"
          />
        </div>
        <div className="adminEditArmorType__intl">
          <div className="adminEditArmorType__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameArmorType.label', { ns: 'fields' })} (FR)`}
              className="adminEditArmorType__basics__name"
            />
          </div>
          <div className="adminEditArmorType__details">
            <RichTextElement
              label={`${t('armorTypeSummary.title', { ns: 'fields' })} (FR)`}
              editor={textFrEditor ?? undefined}
              rawStringContent={armorTypeTextFr}
              small
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditArmorType.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditArmorType;
