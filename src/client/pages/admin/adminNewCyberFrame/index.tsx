import React, { useCallback, useMemo, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input, SmartSelect } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';

import type { ErrorResponseType } from '../../../types';
import type { InternationalizationType } from '../../../types/global';

import { classTrim } from '../../../utils';

import './adminNewCyberFrame.scss';

interface FormValues {
  name: string;
  nameFr: string;
  ruleBook: string;
  stats: Record<string, number | undefined>;
  charParams: Record<string, number>;
}

const AdminNewCyberFrame: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { ruleBooks, reloadCyberFrames, charParams, stats } = useGlobalVars();

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

  const onSaveCyberFrame: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, ruleBook, stats: sentStats, charParams: sentCharParams }) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }

      const relevantStats: Array<{
        id: string;
        value: number;
      }> = [];
      Object.keys(sentStats).forEach((statId) => {
        if (sentStats[statId] !== undefined && sentStats[statId] > 0) {
          relevantStats.push({
            id: statId.split('-')[1],
            value: sentStats[statId],
          });
        }
      });
      const relevantCharParams: Array<{
        id: string;
        value: number;
      }> = [];
      Object.keys(sentCharParams).forEach((charParamId) => {
        relevantCharParams.push({
          id: charParamId.split('-')[1],
          value: sentCharParams[charParamId],
        });
      });

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

      api.cyberFrames
        .create({
          title: name,
          ruleBook,
          summary: html,
          i18n,
          stats: relevantStats,
          charParams: relevantCharParams,
        })
        .then((cyberFrame) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewCyberFrame.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadCyberFrames();
          void navigate(`/admin/cyberframe/${cyberFrame._id}`);
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.cyberFrameType.${data.sent}`), 'capitalize'),
              }),
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.cyberFrameType.${data.sent}`), 'capitalize'),
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
      reloadCyberFrames,
      navigate,
      setError,
    ]
  );

  return (
    <div
      className={classTrim(`
        adminNewCyberFrame
        ${displayInt ? 'adminNewCyberFrame--int-visible' : ''}
      `)}
    >
      <form
        className="adminNewCyberFrame__content"
        onSubmit={(evt) => {
          void handleSubmit(onSaveCyberFrame)(evt);
        }}
        noValidate
      >
        <Atitle level={1}>{t('adminNewCyberFrame.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewCyberFrame__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameCyberFrame.required', { ns: 'fields' }) }}
            label={t('nameCyberFrame.label', { ns: 'fields' })}
            className="adminNewCyberFrame__basics__name"
          />
          <SmartSelect
            control={control}
            inputName="ruleBook"
            rules={{ required: t('linkedRuleBook.required', { ns: 'fields' }) }}
            label={t('linkedRuleBook.label', { ns: 'fields' })}
            options={ruleBookSelect}
            className="adminNewCyberFrame__basics__type"
          />
        </div>
        <div className="adminNewCyberFrame__details">
          <RichTextElement
            label={t('cyberFrameText.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
        </div>
        <div className="adminNewCyberFrame__params">
          <div className="adminNewCyberFrame__params__content">
            <Atitle className="adminNewCyberFrame__params__title" level={2}>
              {t('adminNewCyberFrame.charParams', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminNewCyberFrame__params__info">
              {t('adminNewCyberFrame.charParamsInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <div className="adminNewCyberFrame__params__list">
            {charParams.map((charParam) => (
              <Input
                key={charParam.charParam._id}
                control={control}
                inputName={`charParams.charParam-${charParam.charParam._id}`}
                type="number"
                rules={{ required: t('charParamCyberFrameValue.required', { ns: 'fields' }) }}
                label={charParam.charParam.title}
                className="adminNewCyberFrame__params__list__value"
              />
            ))}
          </div>
        </div>
        <div className="adminNewCyberFrame__stats">
          <div className="adminNewCyberFrame__stats__content">
            <Atitle className="adminNewCyberFrame__stats__title" level={2}>
              {t('adminNewCyberFrame.stats', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminNewCyberFrame__stats__info">
              {t('adminNewCyberFrame.statsInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <div className="adminNewCyberFrame__stats__list">
            {stats.map((stat) => (
              <Input
                key={stat.stat._id}
                control={control}
                inputName={`stats.stat-${stat.stat._id}`}
                type="number"
                label={stat.stat.title}
                className="adminNewCyberFrame__stats__list__value"
              />
            ))}
          </div>
        </div>
        <div className="adminNewCyberFrame__intl-title">
          <div className="adminNewCyberFrame__intl-title__content">
            <Atitle className="adminNewCyberFrame__intl-title__title" level={2}>
              {t('adminNewCyberFrame.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminNewCyberFrame__intl-title__info">
              {t('adminNewCyberFrame.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt((prev) => !prev);
            }}
            className="adminNewCyberFrame__intl-title__btn"
          />
        </div>
        <div className="adminNewCyberFrame__intl">
          <div className="adminNewCyberFrame__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameCyberFrame.label', { ns: 'fields' })} (FR)`}
              className="adminNewCyberFrame__basics__name"
            />
          </div>
          <div className="adminNewCyberFrame__details">
            <RichTextElement
              label={`${t('cyberFrameText.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent=""
              small
              complete
            />
          </div>
        </div>
        <Button type="submit">{t('adminNewCyberFrame.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewCyberFrame;
