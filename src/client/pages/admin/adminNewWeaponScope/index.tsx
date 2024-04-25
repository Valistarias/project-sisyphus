import React, { useCallback, useEffect, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';

import './adminNewWeaponScope.scss';

interface FormValues {
  name: string;
  nameFr: string;
  scopeId: string;
}

const AdminNewWeaponScope: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { reloadWeaponScopes } = useGlobalVars();

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

  const onSaveWeaponScope: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, scopeId }) => {
      if (
        introEditor === null ||
        introFrEditor === null ||
        api === undefined ||
        scopeId === undefined
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

      api.weaponScopes
        .create({
          title: name,
          summary: html,
          scopeId,
          i18n,
        })
        .then((weaponScope) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewWeaponScope.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadWeaponScopes();
          navigate(`/admin/weaponscope/${weaponScope._id}`);
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
      introEditor,
      introFrEditor,
      api,
      getNewId,
      createAlert,
      t,
      reloadWeaponScopes,
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
    <div className="adminNewWeaponScope">
      <form
        className="adminNewWeaponScope__content"
        onSubmit={handleSubmit(onSaveWeaponScope)}
        noValidate
      >
        <Atitle level={1}>{t('adminNewWeaponScope.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewWeaponScope__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameWeaponScope.required', { ns: 'fields' }),
            }}
            label={t('nameWeaponScope.label', { ns: 'fields' })}
            className="adminNewWeaponScope__basics__name"
          />
        </div>
        <div className="adminNewWeaponScope__details">
          <RichTextElement
            label={t('weaponScopeSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={''}
            small
            complete
          />
          <Input
            control={control}
            inputName="scopeId"
            type="text"
            rules={{
              required: t('weaponScopeFormula.required', { ns: 'fields' }),
              pattern: {
                value: /^([a-z]){3}$/,
                message: t('weaponScopeFormula.format', { ns: 'fields' }),
              },
            }}
            label={t('weaponScopeFormula.label', { ns: 'fields' })}
          />
        </div>

        <Atitle className="adminNewWeaponScope__intl" level={2}>
          {t('adminNewWeaponScope.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewWeaponScope__intl-info">
          {t('adminNewWeaponScope.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewWeaponScope__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameWeaponScope.label', { ns: 'fields' })} (FR)`}
            className="adminNewWeaponScope__basics__name"
          />
        </div>
        <div className="adminNewWeaponScope__details">
          <RichTextElement
            label={`${t('weaponScopeSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent={''}
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewWeaponScope.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewWeaponScope;
