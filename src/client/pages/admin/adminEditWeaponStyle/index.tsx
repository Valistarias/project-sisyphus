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
  Button, Input, SmartSelect, type ISingleValueSelect
} from '../../../molecules';
import {
  Alert, RichTextElement, completeRichTextElementExtentions
} from '../../../organisms';

import type { ConfirmMessageDetailData } from '../../../providers/confirmMessage';
import type { ErrorResponseType, ICuratedWeaponStyle } from '../../../types';
import type { InternationalizationType } from '../../../types/global';

import { classTrim } from '../../../utils';

import './adminEditWeaponStyle.scss';

interface FormValues {
  name: string
  nameFr: string
  skill: string
}

const AdminEditWeaponStyle: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const {
    skills, reloadWeaponStyles
  } = useGlobalVars();
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

  const [weaponStyleData, setWeaponStyleData]
  = useState<ICuratedWeaponStyle | null>(null);

  const [weaponStyleText, setWeaponStyleText] = useState('');
  const [weaponStyleTextFr, setWeaponStyleTextFr] = useState('');

  const textEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const textFrEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const skillSelect = useMemo<ISingleValueSelect[]>(
    () =>
      skills.map(({ skill }) => ({
        value: skill._id,
        // TODO : Handle Internationalization
        label: skill.title
      })),
    [skills]
  );

  const createDefaultData = useCallback(
    (
      weaponStyleData: ICuratedWeaponStyle | null,
      skills: ISingleValueSelect[]
    ) => {
      if (weaponStyleData == null) {
        return {};
      }
      const {
        weaponStyle, i18n
      } = weaponStyleData;
      const defaultData: Partial<FormValues> = {};
      defaultData.name = weaponStyle.title;
      const selectedfield = skills.find(
        skillType => skillType.value === weaponStyle.skill._id
      );
      if (selectedfield !== undefined) {
        defaultData.skill = String(selectedfield.value);
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
    reset
  } = useForm({ defaultValues: useMemo(
    () => createDefaultData(weaponStyleData, skillSelect),
    [
      createDefaultData,
      skillSelect,
      weaponStyleData
    ]
  ) });

  const onSaveWeaponStyle: SubmitHandler<FormValues> = useCallback(
    ({
      name, nameFr, skill
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

      api.weaponStyles
        .update({
          id,
          title: name,
          skill,
          summary: htmlText,
          i18n
        })
        .then(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditWeaponStyle.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          reloadWeaponStyles();
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
      reloadWeaponStyles,
      setError
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditWeaponStyle.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditWeaponStyle.confirmDeletion.text', {
          ns: 'pages',
          elt: weaponStyleData?.weaponStyle.title
        }),
        confirmCta: t('adminEditWeaponStyle.confirmDeletion.confirmCta', { ns: 'pages' })
      },
      (evtId: string) => {
        const confirmDelete = (
          { detail }: { detail: ConfirmMessageDetailData }
        ): void => {
          if (detail.proceed) {
            api.weaponStyles
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditWeaponStyle.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  )
                });
                reloadWeaponStyles();
                void navigate('/admin/weaponstyles');
              })
              .catch(({ response }: ErrorResponseType) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.weaponStyle.name`), 'capitalize') })
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.weaponStyle.name`), 'capitalize') })
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
    weaponStyleData?.weaponStyle.title,
    addConfirmEventListener,
    removeConfirmEventListener,
    id,
    getNewId,
    createAlert,
    reloadWeaponStyles,
    navigate,
    setError
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.weaponStyles
        .get({ weaponStyleId: id })
        .then((curatedWeaponStyle) => {
          const {
            weaponStyle, i18n
          } = curatedWeaponStyle;
          setWeaponStyleData(curatedWeaponStyle);
          setWeaponStyleText(weaponStyle.summary);
          if (i18n.fr !== undefined) {
            setWeaponStyleTextFr(i18n.fr.summary ?? '');
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
      handleSubmit(onSaveWeaponStyle)().then(
        () => undefined,
        () => undefined
      );
    }, 600000);

    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveWeaponStyle]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(weaponStyleData, skillSelect));
  }, [
    weaponStyleData,
    reset,
    createDefaultData,
    skillSelect
  ]);

  return (
    <div
      className={classTrim(`
        adminEditWeaponStyle
        ${displayInt ? 'adminEditWeaponStyle--int-visible' : ''}
      `)}
    >
      <form
        onSubmit={() => handleSubmit(onSaveWeaponStyle)}
        noValidate
        className="adminEditWeaponStyle__content"
      >
        <div className="adminEditWeaponStyle__head">
          <Atitle level={1}>{weaponStyleData?.weaponStyle.title}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditWeaponStyle.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Button
          className="adminEditWeaponStyle__return-btn"
          href="/admin/weaponstyles"
          size="small"
        >
          {t('adminEditWeaponStyle.return', { ns: 'pages' })}
        </Button>
        <Atitle level={2}>{t('adminEditWeaponStyle.edit', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror className="adminEditWeaponStyle__error">{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminEditWeaponStyle__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameWeaponStyle.required', { ns: 'fields' }) }}
            label={t('nameWeaponStyle.label', { ns: 'fields' })}
            className="adminEditWeaponStyle__basics__name"
          />
          <SmartSelect
            control={control}
            inputName="skill"
            label={t('weaponStyleSkill.label', { ns: 'fields' })}
            rules={{ required: t('weaponStyleSkill.required', { ns: 'fields' }) }}
            options={skillSelect}
            className="adminEditWeaponStyle__basics__skill"
          />
        </div>
        <div className="adminEditWeaponStyle__details">
          <RichTextElement
            label={t('weaponStyleSummary.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={weaponStyleText}
            small
          />
        </div>
        <div className="adminEditWeaponStyle__intl-title">
          <div className="adminEditWeaponStyle__intl-title__content">
            <Atitle className="adminEditWeaponStyle__intl-title__title" level={2}>
              {t('adminEditWeaponStyle.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditWeaponStyle__intl-title__info">
              {t('adminEditWeaponStyle.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt(prev => !prev);
            }}
            className="adminEditWeaponStyle__intl-title__btn"
          />
        </div>
        <div className="adminEditWeaponStyle__intl">
          <div className="adminEditWeaponStyle__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameWeaponStyle.label', { ns: 'fields' })} (FR)`}
              className="adminEditWeaponStyle__basics__name"
            />
          </div>
          <div className="adminEditWeaponStyle__details">
            <RichTextElement
              label={`${t('weaponStyleSummary.title', { ns: 'fields' })} (FR)`}
              editor={textFrEditor ?? undefined}
              rawStringContent={weaponStyleTextFr}
              small
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditWeaponStyle.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditWeaponStyle;
