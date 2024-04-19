import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input, NodeIconSelect, SmartSelect } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';

import './adminNewWeaponType.scss';

interface FormValues {
  name: string;
  nameFr: string;
  weaponStyle: string;
  icon: string;
}

const AdminNewWeaponType: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { weaponStyles, reloadWeaponTypes } = useGlobalVars();

  const [, setLoading] = useState(true);
  const calledApi = useRef(false);

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<FieldValues>();

  const weaponStyleList = useMemo(() => {
    return weaponStyles.map(({ weaponStyle }) => ({
      value: weaponStyle._id,
      label: weaponStyle.title,
    }));
  }, [weaponStyles]);

  const onSaveWeaponType: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, weaponStyle, icon }) => {
      if (
        introEditor === null ||
        introFrEditor === null ||
        api === undefined ||
        icon === undefined
      ) {
        return;
      }
      let html: string | null = introEditor.getHTML();
      const htmlFr = introFrEditor.getHTML();
      if (html === '<p class="ap"></p>') {
        html = null;
      }

      let i18n: any | null = null;

      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        i18n = {
          fr: {
            title: nameFr,
            summary: htmlFr,
          },
        };
      }

      api.weaponTypes
        .create({
          title: name,
          weaponStyle,
          icon,
          summary: html,
          i18n,
        })
        .then((weaponStyle) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewWeaponType.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadWeaponTypes();
          navigate(`/admin/weapontype/${weaponStyle._id}`);
        })
        .catch(({ response }) => {
          const { data } = response;
          setError('root.serverError', {
            type: 'server',
            message: t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`terms.charparamsType.${data.sent}`), 'capitalize'),
            }),
          });
        });
    },
    [
      introEditor,
      introFrEditor,
      api,
      getNewId,
      createAlert,
      t,
      reloadWeaponTypes,
      navigate,
      setError,
    ]
  );

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
    }
  }, [api, createAlert, getNewId, t]);

  return (
    <div className="adminNewWeaponType">
      <form
        className="adminNewWeaponType__content"
        onSubmit={handleSubmit(onSaveWeaponType)}
        noValidate
      >
        <Atitle level={1}>{t('adminNewWeaponType.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewWeaponType__visual">
          <NodeIconSelect
            label={t('iconWeaponType.label', { ns: 'fields' })}
            control={control}
            inputName="icon"
            rules={{
              required: t('iconWeaponType.required', { ns: 'fields' }),
            }}
          />
        </div>
        <div className="adminNewWeaponType__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameWeaponType.required', { ns: 'fields' }),
            }}
            label={t('nameWeaponType.label', { ns: 'fields' })}
            className="adminNewWeaponType__basics__name"
          />
          <SmartSelect
            control={control}
            inputName="weaponStyle"
            label={t('weaponTypeWeaponSkill.label', { ns: 'fields' })}
            rules={{ required: t('weaponTypeWeaponSkill.required', { ns: 'fields' }) }}
            options={weaponStyleList}
            className="adminNewWeaponType__basics__weaponStyle"
          />
        </div>
        <div className="adminNewWeaponType__details">
          <RichTextElement
            label={t('weaponStyleSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={''}
            small
            complete
          />
        </div>

        <Atitle className="adminNewWeaponType__intl" level={2}>
          {t('adminNewWeaponType.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewWeaponType__intl-info">
          {t('adminNewWeaponType.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewWeaponType__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameWeaponType.label', { ns: 'fields' })} (FR)`}
            className="adminNewWeaponType__basics__name"
          />
        </div>
        <div className="adminNewWeaponType__details">
          <RichTextElement
            label={`${t('weaponStyleSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent={''}
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewWeaponType.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewWeaponType;
