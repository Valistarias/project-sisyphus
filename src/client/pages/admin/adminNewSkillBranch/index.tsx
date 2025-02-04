import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useApi, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';

import type { ICuratedSkill } from '../../../types';
import type { ErrorResponseType, InternationalizationType } from '../../../types/global';

import './adminNewSkillBranch.scss';

interface FormValues {
  name: string;
  nameFr: string;
}

const AdminNewSkillBranch: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const [skill, setSkill] = useState<ICuratedSkill | null>(null);

  const [, setLoading] = useState(true);
  const calledApi = useRef(false);

  const introEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const introFrEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm();

  const getSkill = useCallback(() => {
    if (api !== undefined) {
      api.skills
        .get({ skillId: params.get('skillId') ?? '' })
        .then((sentSkill) => {
          setLoading(false);
          setSkill(sentSkill);
        })
        .catch(() => {
          setLoading(false);
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
  }, [api, createAlert, getNewId, params, t]);

  const onSaveSkillBranch: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr }) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }
      let html: string | null = introEditor.getHTML();
      const htmlFr = introFrEditor.getHTML();
      if (html === '<p class="ap"></p>') {
        html = null;
      }

      let i18n: InternationalizationType | null = null;

      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        i18n = {
          fr: {
            title: nameFr,
            summary: htmlFr,
          },
        };
      }

      api.skillBranches
        .create({
          title: name,
          skill: params.get('skillId'),
          summary: html,
          i18n,
        })
        .then((skillBranch) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewSkillBranch.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          void navigate(`/admin/skillbranch/${skillBranch._id}`);
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.skillBranchType.${data.sent}`), 'capitalize'),
              }),
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.skillBranchType.${data.sent}`), 'capitalize'),
              }),
            });
          }
        });
    },
    [introEditor, introFrEditor, api, params, getNewId, createAlert, t, navigate, setError]
  );

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
      getSkill();
    }
  }, [api, createAlert, getNewId, getSkill, t]);

  return (
    <div className="adminNewSkillBranch">
      <form
        className="adminNewSkillBranch__content"
        onSubmit={(evt) => {
          void handleSubmit(onSaveSkillBranch)(evt);
        }}
        noValidate
      >
        <Atitle className="adminNewSkillBranch__head" level={1}>
          {t('adminNewSkillBranch.title', { ns: 'pages' })}
        </Atitle>
        <div className="adminNewSkillBranch__ariane">
          <Ap className="adminNewSkillBranch__ariane__elt">
            {`${t(`terms.skill.name`)}: ${skill?.skill.title}`}
          </Ap>
        </div>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewSkillBranch__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameSkillBranch.required', { ns: 'fields' }) }}
            label={t('nameSkillBranch.label', { ns: 'fields' })}
            className="adminNewSkillBranch__basics__name"
          />
        </div>
        <div className="adminNewSkillBranch__details">
          <RichTextElement
            label={t('skillBranchSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
        </div>

        <Atitle className="adminNewSkillBranch__intl" level={2}>
          {t('adminNewSkillBranch.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewSkillBranch__intl-info">
          {t('adminNewSkillBranch.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewSkillBranch__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameSkillBranch.label', { ns: 'fields' })} (FR)`}
            className="adminNewSkillBranch__basics__name"
          />
        </div>
        <div className="adminNewSkillBranch__details">
          <RichTextElement
            label={`${t('skillBranchSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent=""
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewSkillBranch.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewSkillBranch;
