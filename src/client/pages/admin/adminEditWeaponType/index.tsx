import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import {
  Button,
  Input,
  NodeIconSelect,
  SmartSelect,
  type ISingleValueSelect,
} from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';
import { type ICuratedWeaponType } from '../../../types';

import { classTrim } from '../../../utils';

import './adminEditWeaponType.scss';

interface FormValues {
  name: string;
  nameFr: string;
  weaponStyle: string;
  itemType: string;
  icon: string;
  needTraining: string;
}

const AdminEditWeaponType: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { weaponStyles, itemTypes, reloadWeaponTypes } = useGlobalVars();
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

  const [weaponTypeData, setWeaponTypeData] = useState<ICuratedWeaponType | null>(null);

  const [weaponTypeText, setWeaponTypeText] = useState('');
  const [weaponTypeTextFr, setWeaponTypeTextFr] = useState('');

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const textFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const boolRange = useMemo(
    () => [
      {
        value: '1',
        label: t('terms.general.yes'),
      },
      {
        value: '0',
        label: t('terms.general.no'),
      },
    ],
    [t]
  );

  const weaponStyleSelect = useMemo<ISingleValueSelect[]>(
    () =>
      weaponStyles.map(({ weaponStyle }) => ({
        value: weaponStyle._id,
        // TODO : Handle Internationalization
        label: weaponStyle.title,
      })),
    [weaponStyles]
  );

  const itemTypeList = useMemo(() => {
    const curatedList: Array<{
      value: string;
      label: string;
    }> = [];
    itemTypes.forEach((itemType) => {
      if (itemType.name === 'wep' || itemType.name === 'psm') {
        curatedList.push({
          value: itemType._id,
          label: t(`itemTypeNames.${itemType.name}`),
        });
      }
    });
    return curatedList;
  }, [itemTypes, t]);

  const createDefaultData = useCallback(
    (
      weaponTypeData: ICuratedWeaponType | null,
      weaponStylesSelect: ISingleValueSelect[],
      itemTypesSelect: ISingleValueSelect[]
    ) => {
      if (weaponTypeData == null) {
        return {};
      }
      const { weaponType, i18n } = weaponTypeData;
      const defaultData: Partial<FormValues> = {};
      defaultData.name = weaponType.title;
      defaultData.icon = weaponType.icon;
      defaultData.needTraining = weaponType.needTraining ? '1' : '0';
      const selectedWeaponStyle = weaponStylesSelect.find(
        (weaponStyleType) => weaponStyleType.value === weaponType.weaponStyle?._id
      );
      if (selectedWeaponStyle !== undefined) {
        defaultData.weaponStyle = String(selectedWeaponStyle.value);
      }
      const selectedItemType = itemTypesSelect.find(
        (itemType) => itemType.value === weaponType.itemType?._id
      );
      if (selectedItemType !== undefined) {
        defaultData.itemType = String(selectedItemType.value);
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
      () => createDefaultData(weaponTypeData, weaponStyleSelect, itemTypeList),
      [createDefaultData, weaponStyleSelect, weaponTypeData, itemTypeList]
    ),
  });

  const onSaveWeaponType: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, weaponStyle, icon, needTraining, itemType }) => {
      if (
        weaponTypeText === null ||
        weaponTypeTextFr === null ||
        textEditor === null ||
        textFrEditor === null ||
        icon === null ||
        needTraining === null ||
        itemType === null ||
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

      api.weaponTypes
        .update({
          id,
          title: name,
          weaponStyle,
          icon,
          itemType,
          needTraining: needTraining === '1',
          summary: htmlText,
          i18n,
        })
        .then(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditWeaponType.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadWeaponTypes();
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
      weaponTypeText,
      weaponTypeTextFr,
      textEditor,
      textFrEditor,
      api,
      id,
      getNewId,
      createAlert,
      t,
      reloadWeaponTypes,
      setError,
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditWeaponType.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditWeaponType.confirmDeletion.text', {
          ns: 'pages',
          elt: weaponTypeData?.weaponType.title,
        }),
        confirmCta: t('adminEditWeaponType.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.weaponTypes
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditWeaponType.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                reloadWeaponTypes();
                navigate('/admin/weapontypes');
              })
              .catch(({ response }) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.weaponType.name`), 'capitalize'),
                    }),
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.weaponType.name`), 'capitalize'),
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
    weaponTypeData,
    ConfMessageEvent,
    id,
    getNewId,
    createAlert,
    reloadWeaponTypes,
    navigate,
    setError,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.weaponTypes
        .get({ weaponTypeId: id })
        .then((curatedWeaponType: ICuratedWeaponType) => {
          const { weaponType, i18n } = curatedWeaponType;
          setWeaponTypeData(curatedWeaponType);
          setWeaponTypeText(weaponType.summary);
          if (i18n.fr !== undefined) {
            setWeaponTypeTextFr(i18n.fr.summary ?? '');
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
      handleSubmit(onSaveWeaponType)().then(
        () => {},
        () => {}
      );
    }, 600000);
    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveWeaponType]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(weaponTypeData, weaponStyleSelect, itemTypeList));
  }, [weaponTypeData, reset, createDefaultData, weaponStyleSelect, itemTypeList]);

  return (
    <div
      className={classTrim(`
        adminEditWeaponType
        ${displayInt ? 'adminEditWeaponType--int-visible' : ''}
      `)}
    >
      <form
        onSubmit={handleSubmit(onSaveWeaponType)}
        noValidate
        className="adminEditWeaponType__content"
      >
        <div className="adminEditWeaponType__head">
          <Atitle level={1}>{weaponTypeData?.weaponType.title}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditWeaponType.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Button className="adminEditWeaponType__return-btn" href="/admin/weapontypes" size="small">
          {t('adminEditWeaponType.return', { ns: 'pages' })}
        </Button>
        <Atitle level={2}>{t('adminEditWeaponType.edit', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror className="adminEditWeaponType__error">{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditWeaponType__visual">
          <NodeIconSelect
            label={t('iconWeaponType.label', { ns: 'fields' })}
            control={control}
            inputName="icon"
            rules={{
              required: t('iconWeaponType.required', { ns: 'fields' }),
            }}
          />
        </div>
        <div className="adminEditWeaponType__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameWeaponType.required', { ns: 'fields' }) }}
            label={t('nameWeaponType.label', { ns: 'fields' })}
            className="adminEditWeaponType__basics__name"
          />
          <div className="adminEditWeaponType__basics__class">
            <SmartSelect
              control={control}
              inputName="weaponStyle"
              label={t('weaponTypeWeaponSkill.label', { ns: 'fields' })}
              rules={{ required: t('weaponTypeWeaponSkill.required', { ns: 'fields' }) }}
              options={weaponStyleSelect}
              className="adminEditWeaponType__basics__weaponStyle"
            />
            <SmartSelect
              control={control}
              inputName="itemType"
              label={t('weaponTypeItemType.label', { ns: 'fields' })}
              rules={{ required: t('weaponTypeItemType.required', { ns: 'fields' }) }}
              options={itemTypeList}
              className="adminNewWeaponType__basics__needTraining"
            />
            <SmartSelect
              control={control}
              inputName={`needTraining`}
              label={t('weaponTypeNeedTraining.label', { ns: 'fields' })}
              rules={{ required: t('weaponTypeNeedTraining.required', { ns: 'fields' }) }}
              options={boolRange}
              className="adminEditWeaponType__basics__needTraining"
            />
          </div>
        </div>
        <div className="adminEditWeaponType__details">
          <RichTextElement
            label={t('weaponTypeSummary.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={weaponTypeText}
            small
          />
        </div>
        <div className="adminEditWeaponType__intl-title">
          <div className="adminEditWeaponType__intl-title__content">
            <Atitle className="adminEditWeaponType__intl-title__title" level={2}>
              {t('adminEditWeaponType.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditWeaponType__intl-title__info">
              {t('adminEditWeaponType.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt((prev) => !prev);
            }}
            className="adminEditWeaponType__intl-title__btn"
          />
        </div>
        <div className="adminEditWeaponType__intl">
          <div className="adminEditWeaponType__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameWeaponType.label', { ns: 'fields' })} (FR)`}
              className="adminEditWeaponType__basics__name"
            />
          </div>
          <div className="adminEditWeaponType__details">
            <RichTextElement
              label={`${t('weaponTypeSummary.title', { ns: 'fields' })} (FR)`}
              editor={textFrEditor ?? undefined}
              rawStringContent={weaponTypeTextFr}
              small
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditWeaponType.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditWeaponType;
