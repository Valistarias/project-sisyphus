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
  NodeIconSelect,
  SmartSelect,
  type ISingleValueSelect,
} from '../../../molecules';
import {
  Alert,
  DragList,
  type IDragElt,
  RichTextElement,
  completeRichTextElementExtentions,
} from '../../../organisms';

import type { ConfirmMessageDetailData } from '../../../providers/confirmMessage';
import type { ErrorResponseType, ICuratedClergy } from '../../../types';
import type { InternationalizationType } from '../../../types/global';

import { arraysEqual, classTrim } from '../../../utils';

import './adminEditClergy.scss';

interface FormValues {
  name: string;
  nameFr: string;
  ruleBook: string;
  icon: string;
}

const AdminEditClergy: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { setConfirmContent, removeConfirmEventListener, addConfirmEventListener } =
    useConfirmMessage();
  const { id } = useParams();
  const { ruleBooks, reloadClergies } = useGlobalVars();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [displayInt, setDisplayInt] = useState(false);

  const [clergyData, setClergyData] = useState<ICuratedClergy | null>(null);

  const [clergyText, setClergyText] = useState('');
  const [clergyTextFr, setClergyTextFr] = useState('');

  const [initialOrder, setInitialOrder] = useState<string[]>([]);
  const [vowsOrder, setVowsOrder] = useState<string[]>([]);

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
    (clergyData: ICuratedClergy | null, ruleBookSelect: ISingleValueSelect[]) => {
      if (clergyData == null) {
        return {};
      }
      const { clergy, i18n } = clergyData;

      const defaultData: Partial<FormValues> = {};
      defaultData.name = clergy.title;
      defaultData.icon = clergy.icon;

      const selectedfield = ruleBookSelect.find(
        (singleSelect) => singleSelect.value === clergy.ruleBook
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
      () => createDefaultData(clergyData, ruleBookSelect),
      [createDefaultData, clergyData, ruleBookSelect]
    ),
  });

  const ruleBook = useMemo(() => clergyData?.clergy.ruleBook, [clergyData]);

  const vowsDragData = useMemo(() => {
    const vowsData = clergyData?.clergy.vows ?? [];
    if (vowsData.length === 0) {
      return {};
    }

    const vows: Record<string, IDragElt> = {};
    vowsData.forEach((vowData) => {
      vows[vowData.vow._id] = {
        id: vowData.vow._id,
        title: vowData.vow.title,
        button: {
          href: `/admin/vow/${vowData.vow._id}`,
          content: t('adminEditClergy.editVow', { ns: 'pages' }),
        },
      };
    });

    return vows;
  }, [clergyData, t]);

  const onVowOrder = useCallback((elt: string[], isInitial: boolean) => {
    setVowsOrder(elt);
    if (isInitial) {
      setInitialOrder(elt);
    }
  }, []);

  const onSaveClergy: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, ruleBook, icon }) => {
      if (textEditor === null || textFrEditor === null || api === undefined) {
        return;
      }

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

      api.clergies
        .update({
          id,
          title: name,
          ruleBook,
          icon,
          summary: htmlText,
          i18n,
        })
        .then(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditClergy.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadClergies();
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.clergyType.${data.sent}`), 'capitalize'),
              }),
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.clergyType.${data.sent}`), 'capitalize'),
              }),
            });
          }
        });
    },
    [textEditor, textFrEditor, api, id, getNewId, createAlert, t, reloadClergies, setError]
  );

  const onUpdateOrder = useCallback(() => {
    if (arraysEqual(vowsOrder, initialOrder) || api === undefined || id === undefined) {
      return;
    }

    api.clergies
      .changeVowsOrder({
        id,
        order: vowsOrder.map((vow, index) => ({
          id: vow,
          position: index,
        })),
      })
      .then(() => {
        const newId = getNewId();
        createAlert({
          key: newId,
          dom: (
            <Alert key={newId} id={newId} timer={5}>
              <Ap>{t('adminEditRuleBook.successUpdate', { ns: 'pages' })}</Ap>
            </Alert>
          ),
        });
        setInitialOrder(vowsOrder);
      })
      .catch(({ response }: ErrorResponseType) => {
        const { data } = response;
        if (data.code === 'CYPU-104') {
          setError('root.serverError', {
            type: 'server',
            message: t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize'),
            }),
          });
        } else {
          setError('root.serverError', {
            type: 'server',
            message: t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize'),
            }),
          });
        }
      });
  }, [vowsOrder, initialOrder, api, id, getNewId, createAlert, t, setError]);

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditClergy.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditClergy.confirmDeletion.text', {
          ns: 'pages',
          elt: clergyData?.clergy.title,
        }),
        confirmCta: t('adminEditClergy.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }: { detail: ConfirmMessageDetailData }): void => {
          if (detail.proceed) {
            api.clergies
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditClergy.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                reloadClergies();
                void navigate('/admin/clergies');
              })
              .catch(({ response }: ErrorResponseType) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.clergy.name`), 'capitalize'),
                    }),
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.clergy.name`), 'capitalize'),
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
    clergyData?.clergy.title,
    addConfirmEventListener,
    removeConfirmEventListener,
    id,
    getNewId,
    createAlert,
    reloadClergies,
    navigate,
    setError,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.clergies
        .get({ clergyId: id })
        .then((curatedClergy) => {
          const { clergy, i18n } = curatedClergy;
          setClergyData(curatedClergy);
          setClergyText(clergy.summary);
          if (i18n.fr !== undefined) {
            setClergyTextFr(i18n.fr.summary ?? '');
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
      handleSubmit(onSaveClergy)().then(
        () => undefined,
        () => undefined
      );
    }, 600000);

    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveClergy]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(clergyData, ruleBookSelect));
  }, [clergyData, ruleBookSelect, reset, createDefaultData]);

  return (
    <div
      className={classTrim(`
        adminEditClergy
        ${displayInt ? 'adminEditClergy--int-visible' : ''}
      `)}
    >
      <form
        onSubmit={(evt) => {
          void handleSubmit(onSaveClergy)(evt);
        }}
        noValidate
        className="adminEditClergy__content"
      >
        <div className="adminEditClergy__head">
          <Atitle level={1}>{clergyData?.clergy.title}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditClergy.delete', { ns: 'pages' })}
          </Button>
        </div>
        <LinkButton className="adminEditClergy__return-btn" href="/admin/clergies" size="small">
          {t('adminEditClergy.return', { ns: 'pages' })}
        </LinkButton>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror className="adminEditClergy__error">{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditClergy__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameClergy.required', { ns: 'fields' }) }}
            label={t('nameClergy.label', { ns: 'fields' })}
            className="adminEditClergy__basics__name"
          />
          <SmartSelect
            control={control}
            inputName="ruleBook"
            rules={{ required: t('linkedRuleBook.required', { ns: 'fields' }) }}
            label={t('linkedRuleBook.label', { ns: 'fields' })}
            options={ruleBookSelect}
            className="adminEditClergy__basics__type"
          />
          <NodeIconSelect
            label={t('iconClergy.label', { ns: 'fields' })}
            control={control}
            inputName="icon"
            rules={{ required: t('iconClergy.required', { ns: 'fields' }) }}
          />
        </div>
        <div className="adminEditClergy__details">
          <RichTextElement
            label={t('clergyText.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={clergyText}
            ruleBookId={ruleBook ?? undefined}
            small
            complete
          />
        </div>
        <div className="adminEditClergy__intl-title">
          <div className="adminEditClergy__intl-title__content">
            <Atitle className="adminEditClergy__intl-title__title" level={2}>
              {t('adminEditClergy.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditClergy__intl-title__info">
              {t('adminEditClergy.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt((prev) => !prev);
            }}
            className="adminEditClergy__intl-title__btn"
          />
        </div>
        <div className="adminEditClergy__intl">
          <div className="adminEditClergy__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameClergy.label', { ns: 'fields' })} (FR)`}
              className="adminEditClergy__basics__name"
            />
          </div>
          <div className="adminEditClergy__details">
            <RichTextElement
              label={`${t('clergyText.title', { ns: 'fields' })} (FR)`}
              editor={textFrEditor ?? undefined}
              rawStringContent={clergyTextFr}
              ruleBookId={ruleBook ?? undefined}
              small
              complete
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditClergy.button', { ns: 'pages' })}</Button>
      </form>
      <div className="adminEditClergy__content__lists">
        <div className="adminEditClergy__vows">
          <Atitle className="adminEditClergy__vows__title" level={2}>
            {t('adminEditClergy.vows', { ns: 'pages' })}
          </Atitle>
          <DragList
            className="adminEditClergy__draglist"
            data={vowsDragData}
            id="main"
            onChange={onVowOrder}
          />
          <div className="adminEditClergy__vows__buttons">
            {!arraysEqual(vowsOrder, initialOrder) ? (
              <Button onClick={onUpdateOrder}>
                {t('adminEditClergy.updateOrder', { ns: 'pages' })}
              </Button>
            ) : null}
            <LinkButton href={`/admin/vow/new?clergyId=${id}`}>
              {t('adminEditClergy.createVow', { ns: 'pages' })}
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditClergy;
