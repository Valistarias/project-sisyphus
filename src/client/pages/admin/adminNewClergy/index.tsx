import React, { useCallback, useMemo, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input, NodeIconSelect, SmartSelect } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';

import type { ErrorResponseType } from '../../../types';
import type { InternationalizationType } from '../../../types/global';

import { classTrim } from '../../../utils';

import './adminNewClergy.scss';

interface FormValues {
  name: string;
  nameFr: string;
  ruleBook: string;
  icon: string;
}

const AdminNewClergy: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { ruleBooks, reloadClergies } = useGlobalVars();

  const [displayInt, setDisplayInt] = useState(false);

  const introEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const introFrEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm();

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

  const onSaveClergy: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, ruleBook, icon }) => {
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

      api.clergies
        .create({
          title: name,
          ruleBook,
          icon,
          summary: html,
          i18n,
        })
        .then((clergy) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewClergy.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadClergies();
          void navigate(`/admin/clergy/${clergy._id}`);
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
    [introEditor, introFrEditor, api, getNewId, createAlert, t, reloadClergies, navigate, setError]
  );

  return (
    <div
      className={classTrim(`
        adminNewClergy
        ${displayInt ? 'adminNewClergy--int-visible' : ''}
      `)}
    >
      <form
        className="adminNewClergy__content"
        onSubmit={(evt) => {
          void handleSubmit(onSaveClergy)(evt);
        }}
        noValidate
      >
        <Atitle level={1}>{t('adminNewClergy.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewClergy__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameClergy.required', { ns: 'fields' }) }}
            label={t('nameClergy.label', { ns: 'fields' })}
            className="adminNewClergy__basics__name"
          />
          <SmartSelect
            control={control}
            inputName="ruleBook"
            rules={{ required: t('linkedRuleBook.required', { ns: 'fields' }) }}
            label={t('linkedRuleBook.label', { ns: 'fields' })}
            options={ruleBookSelect}
            className="adminNewClergy__basics__type"
          />
          <NodeIconSelect
            label={t('iconClergy.label', { ns: 'fields' })}
            control={control}
            inputName="icon"
            rules={{ required: t('iconClergy.required', { ns: 'fields' }) }}
          />
        </div>
        <div className="adminNewClergy__details">
          <RichTextElement
            label={t('clergyText.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
        </div>
        <div className="adminNewClergy__intl-title">
          <div className="adminNewClergy__intl-title__content">
            <Atitle className="adminNewClergy__intl-title__title" level={2}>
              {t('adminNewClergy.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminNewClergy__intl-title__info">
              {t('adminNewClergy.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt((prev) => !prev);
            }}
            className="adminNewClergy__intl-title__btn"
          />
        </div>
        <div className="adminNewClergy__intl">
          <div className="adminNewClergy__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameClergy.label', { ns: 'fields' })} (FR)`}
              className="adminNewClergy__basics__name"
            />
          </div>
          <div className="adminNewClergy__details">
            <RichTextElement
              label={`${t('clergyText.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent=""
              small
              complete
            />
          </div>
        </div>
        <Button type="submit">{t('adminNewClergy.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewClergy;
