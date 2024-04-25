import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input, SmartSelect } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';

import './adminNewWeaponStyle.scss';

interface FormValues {
  name: string;
  nameFr: string;
  skill: string;
}

const AdminNewWeaponStyle: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { skills, reloadWeaponStyles } = useGlobalVars();

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

  const skillList = useMemo(() => {
    return skills.map(({ skill }) => ({
      value: skill._id,
      label: skill.title,
    }));
  }, [skills]);

  const onSaveWeaponStyle: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, skill }) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
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

      api.weaponStyles
        .create({
          title: name,
          skill,
          summary: html,
          i18n,
        })
        .then((skill) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewWeaponStyle.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadWeaponStyles();
          navigate(`/admin/weaponstyle/${skill._id}`);
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
      reloadWeaponStyles,
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
    <div className="adminNewWeaponStyle">
      <form
        className="adminNewWeaponStyle__content"
        onSubmit={handleSubmit(onSaveWeaponStyle)}
        noValidate
      >
        <Atitle level={1}>{t('adminNewWeaponStyle.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewWeaponStyle__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameWeaponStyle.required', { ns: 'fields' }),
            }}
            label={t('nameWeaponStyle.label', { ns: 'fields' })}
            className="adminNewWeaponStyle__basics__name"
          />
          <SmartSelect
            control={control}
            inputName="skill"
            label={t('weaponStyleSkill.label', { ns: 'fields' })}
            rules={{ required: t('weaponStyleSkill.required', { ns: 'fields' }) }}
            options={skillList}
            className="adminNewWeaponStyle__basics__skill"
          />
        </div>
        <div className="adminNewWeaponStyle__details">
          <RichTextElement
            label={t('skillSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={''}
            small
            complete
          />
        </div>

        <Atitle className="adminNewWeaponStyle__intl" level={2}>
          {t('adminNewWeaponStyle.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewWeaponStyle__intl-info">
          {t('adminNewWeaponStyle.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewWeaponStyle__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameWeaponStyle.label', { ns: 'fields' })} (FR)`}
            className="adminNewWeaponStyle__basics__name"
          />
        </div>
        <div className="adminNewWeaponStyle__details">
          <RichTextElement
            label={`${t('skillSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent={''}
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewWeaponStyle.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewWeaponStyle;
