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

import type { ConfirmMessageDetailData } from '../../../providers/confirmMessage';
import type { ErrorResponseType, ICuratedRarity } from '../../../types';
import type { InternationalizationType } from '../../../types/global';

import { classTrim } from '../../../utils';

import './adminEditRarity.scss';

interface FormValues {
  name: string
  nameFr: string
}

const AdminEditRarity: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const { reloadRarities } = useGlobalVars();
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

  const [rarityData, setRarityData] = useState<ICuratedRarity | null>(null);

  const [rarityText, setRarityText] = useState('');
  const [rarityTextFr, setRarityTextFr] = useState('');

  const textEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const textFrEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const createDefaultData = useCallback((rarityData: ICuratedRarity | null) => {
    if (rarityData == null) {
      return {};
    }
    const {
      rarity, i18n
    } = rarityData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = rarity.title;
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
    () => createDefaultData(rarityData), [createDefaultData, rarityData]
  ) });

  const onSaveRarity: SubmitHandler<FormValues> = useCallback(
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

      api.rarities
        .update({
          id,
          title: name,
          summary: htmlText,
          i18n
        })
        .then((rarity) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditRarity.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          reloadRarities();
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
      reloadRarities,
      setError
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditRarity.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditRarity.confirmDeletion.text', {
          ns: 'pages',
          elt: rarityData?.rarity.title
        }),
        confirmCta: t('adminEditRarity.confirmDeletion.confirmCta', { ns: 'pages' })
      },
      (evtId: string) => {
        const confirmDelete = (
          { detail }: { detail: ConfirmMessageDetailData }
        ): void => {
          if (detail.proceed) {
            api.rarities
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditRarity.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  )
                });
                reloadRarities();
                void navigate('/admin/rarities');
              })
              .catch(({ response }: ErrorResponseType) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.rarity.name`), 'capitalize') })
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.rarity.name`), 'capitalize') })
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
    rarityData?.rarity.title,
    addConfirmEventListener,
    removeConfirmEventListener,
    id,
    getNewId,
    createAlert,
    reloadRarities,
    navigate,
    setError
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.rarities
        .get({ rarityId: id })
        .then((curatedRarity) => {
          const {
            rarity, i18n
          } = curatedRarity;
          setRarityData(curatedRarity);
          setRarityText(rarity.summary);
          if (i18n.fr !== undefined) {
            setRarityTextFr(i18n.fr.summary ?? '');
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
      handleSubmit(onSaveRarity)().then(
        () => undefined,
        () => undefined
      );
    }, 600000);

    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveRarity]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(rarityData));
  }, [
    rarityData,
    reset,
    createDefaultData
  ]);

  return (
    <div
      className={classTrim(`
        adminEditRarity
        ${displayInt ? 'adminEditRarity--int-visible' : ''}
      `)}
    >
      <form onSubmit={() => handleSubmit(onSaveRarity)} noValidate className="adminEditRarity__content">
        <div className="adminEditRarity__head">
          <Atitle level={1}>{rarityData?.rarity.title}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditRarity.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Button className="adminEditRarity__return-btn" href="/admin/rarities" size="small">
          {t('adminEditRarity.return', { ns: 'pages' })}
        </Button>
        <Atitle level={2}>{t('adminEditRarity.edit', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror className="adminEditRarity__error">{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminEditRarity__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameRarity.required', { ns: 'fields' }) }}
            label={t('nameRarity.label', { ns: 'fields' })}
            className="adminEditRarity__basics__name"
          />
        </div>
        <div className="adminEditRarity__details">
          <RichTextElement
            label={t('raritySummary.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={rarityText}
            small
          />
        </div>
        <div className="adminEditRarity__intl-title">
          <div className="adminEditRarity__intl-title__content">
            <Atitle className="adminEditRarity__intl-title__title" level={2}>
              {t('adminEditRarity.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditRarity__intl-title__info">
              {t('adminEditRarity.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt(prev => !prev);
            }}
            className="adminEditRarity__intl-title__btn"
          />
        </div>
        <div className="adminEditRarity__intl">
          <div className="adminEditRarity__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameRarity.label', { ns: 'fields' })} (FR)`}
              className="adminEditRarity__basics__name"
            />
          </div>
          <div className="adminEditRarity__details">
            <RichTextElement
              label={`${t('raritySummary.title', { ns: 'fields' })} (FR)`}
              editor={textFrEditor ?? undefined}
              rawStringContent={rarityTextFr}
              small
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditRarity.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditRarity;
