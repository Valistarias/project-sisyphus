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
import { type ICuratedItemModifier } from '../../../types';

import { classTrim } from '../../../utils';

import './adminEditItemModifier.scss';

interface FormValues {
  name: string;
  nameFr: string;
  modifierId: string;
}

const AdminEditItemModifier: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { reloadItemModifiers } = useGlobalVars();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage?.() ?? {
    setConfirmContent: () => {},
    ConfMessageEvent: {},
  };
  const { id } = useParams();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [displayInt, setDisplayInt] = useState(false);

  const [itemModifierData, setItemModifierData] = useState<ICuratedItemModifier | null>(null);

  const [itemModifierText, setItemModifierText] = useState('');
  const [itemModifierTextFr, setItemModifierTextFr] = useState('');

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const textFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const createDefaultData = useCallback((itemModifierData: ICuratedItemModifier | null) => {
    if (itemModifierData == null) {
      return {};
    }
    const { itemModifier, i18n } = itemModifierData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = itemModifier.title;
    defaultData.modifierId = itemModifier.modifierId;
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
      () => createDefaultData(itemModifierData),
      [createDefaultData, itemModifierData]
    ),
  });

  const onSaveItemModifier: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, modifierId }) => {
      if (
        itemModifierText === null ||
        itemModifierTextFr === null ||
        textEditor === null ||
        textFrEditor === null ||
        modifierId === null ||
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

      api.itemModifiers
        .update({
          id,
          title: name,
          modifierId,
          summary: htmlText,
          i18n,
        })
        .then((itemModifier) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditItemModifier.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadItemModifiers();
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
      itemModifierText,
      itemModifierTextFr,
      textEditor,
      textFrEditor,
      api,
      id,
      getNewId,
      createAlert,
      t,
      reloadItemModifiers,
      setError,
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditItemModifier.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditItemModifier.confirmDeletion.text', {
          ns: 'pages',
          elt: itemModifierData?.itemModifier.title,
        }),
        confirmCta: t('adminEditItemModifier.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.itemModifiers
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditItemModifier.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                reloadItemModifiers();
                void navigate('/admin/itemmodifiers');
              })
              .catch(({ response }) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.itemModifier.name`), 'capitalize'),
                    }),
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.itemModifier.name`), 'capitalize'),
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
    itemModifierData?.itemModifier.title,
    ConfMessageEvent,
    id,
    getNewId,
    createAlert,
    reloadItemModifiers,
    navigate,
    setError,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.itemModifiers
        .get({ itemModifierId: id })
        .then((curatedItemModifier: ICuratedItemModifier) => {
          const { itemModifier, i18n } = curatedItemModifier;
          setItemModifierData(curatedItemModifier);
          setItemModifierText(itemModifier.summary);
          if (i18n.fr !== undefined) {
            setItemModifierTextFr(i18n.fr.summary ?? '');
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
      handleSubmit(onSaveItemModifier)().then(
        () => {},
        () => {}
      );
    }, 600000);
    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveItemModifier]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(itemModifierData));
  }, [itemModifierData, reset, createDefaultData]);

  return (
    <div
      className={classTrim(`
        adminEditItemModifier
        ${displayInt ? 'adminEditItemModifier--int-visible' : ''}
      `)}
    >
      <form
        onSubmit={handleSubmit(onSaveItemModifier)}
        noValidate
        className="adminEditItemModifier__content"
      >
        <div className="adminEditItemModifier__head">
          <Atitle level={1}>{itemModifierData?.itemModifier.title}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditItemModifier.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Button
          className="adminEditItemModifier__return-btn"
          href="/admin/itemmodifiers"
          size="small"
        >
          {t('adminEditItemModifier.return', { ns: 'pages' })}
        </Button>
        <Atitle level={2}>{t('adminEditItemModifier.edit', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror className="adminEditItemModifier__error">
            {errors.root.serverError.message}
          </Aerror>
        ) : null}
        <div className="adminEditItemModifier__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameItemModifier.required', { ns: 'fields' }) }}
            label={t('nameItemModifier.label', { ns: 'fields' })}
            className="adminEditItemModifier__basics__name"
          />
        </div>
        <div className="adminEditItemModifier__details">
          <RichTextElement
            label={t('itemModifierSummary.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={itemModifierText}
            small
          />
          <Input
            control={control}
            inputName="modifierId"
            type="text"
            rules={{
              required: t('itemModifierFormula.required', { ns: 'fields' }),
              pattern: {
                value: /^([a-z]){2,3}$/,
                message: t('itemModifierFormula.format', { ns: 'fields' }),
              },
            }}
            label={t('itemModifierFormula.label', { ns: 'fields' })}
          />
        </div>
        <div className="adminEditItemModifier__intl-title">
          <div className="adminEditItemModifier__intl-title__content">
            <Atitle className="adminEditItemModifier__intl-title__title" level={2}>
              {t('adminEditItemModifier.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditItemModifier__intl-title__info">
              {t('adminEditItemModifier.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt((prev) => !prev);
            }}
            className="adminEditItemModifier__intl-title__btn"
          />
        </div>
        <div className="adminEditItemModifier__intl">
          <div className="adminEditItemModifier__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameItemModifier.label', { ns: 'fields' })} (FR)`}
              className="adminEditItemModifier__basics__name"
            />
          </div>
          <div className="adminEditItemModifier__details">
            <RichTextElement
              label={`${t('itemModifierSummary.title', { ns: 'fields' })} (FR)`}
              editor={textFrEditor ?? undefined}
              rawStringContent={itemModifierTextFr}
              small
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditItemModifier.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditItemModifier;
