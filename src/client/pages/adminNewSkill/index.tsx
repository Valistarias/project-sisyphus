import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input, SmartSelect } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';

import './adminNewSkill.scss';

interface FormValues {
  name: string;
  nameFr: string;
  stat: string;
  formulaId: string;
}

const AdminNewSkill: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { stats, reloadSkills } = useGlobalVars();

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

  const statList = useMemo(() => {
    return stats.map(({ stat }) => ({
      value: stat._id,
      label: stat.title,
    }));
  }, [stats]);

  const onSaveSkill: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, stat, formulaId }) => {
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

      api.skills
        .create({
          title: name,
          stat,
          formulaId,
          summary: html,
          i18n,
        })
        .then((skill) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewSkill.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadSkills();
          navigate(`/admin/skill/${skill._id}`);
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
    [introEditor, introFrEditor, api, getNewId, createAlert, t, reloadSkills, navigate, setError]
  );

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
    }
  }, [api, createAlert, getNewId, t]);

  return (
    <div className="adminNewSkill">
      <form className="adminNewSkill__content" onSubmit={handleSubmit(onSaveSkill)} noValidate>
        <Atitle level={1}>{t('adminNewSkill.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewSkill__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameSkill.required', { ns: 'fields' }),
            }}
            label={t('nameSkill.label', { ns: 'fields' })}
            className="adminNewSkill__basics__name"
          />
          <SmartSelect
            control={control}
            inputName="stat"
            label={t('statSkill.label', { ns: 'fields' })}
            rules={{ required: t('statSkill.required', { ns: 'fields' }) }}
            options={statList}
            className="adminNewSkill__basics__stat"
          />
        </div>
        <div className="adminNewSkill__details">
          <RichTextElement
            label={t('skillSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={''}
            small
            complete
          />
          <Input
            control={control}
            inputName="formulaId"
            type="text"
            rules={{
              required: t('skillFormula.required', { ns: 'fields' }),
              pattern: {
                value: /^([a-z]){3}$/,
                message: t('skillFormula.format', { ns: 'fields' }),
              },
            }}
            label={t('skillFormula.label', { ns: 'fields' })}
          />
        </div>

        <Atitle className="adminNewSkill__intl" level={2}>
          {t('adminNewSkill.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewSkill__intl-info">{t('adminNewSkill.i18nInfo', { ns: 'pages' })}</Ap>
        <div className="adminNewSkill__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameSkill.label', { ns: 'fields' })} (FR)`}
            className="adminNewSkill__basics__name"
          />
        </div>
        <div className="adminNewSkill__details">
          <RichTextElement
            label={`${t('skillSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent={''}
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewSkill.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewSkill;
