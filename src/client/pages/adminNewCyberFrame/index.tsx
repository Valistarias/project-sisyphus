import React, { useCallback, useMemo, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../providers';

import { Aerror, Ap, Atitle } from '../../atoms';
import { Button, Input, SmartSelect } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';

import './adminNewCyberFrame.scss';

interface FormValues {
  name: string;
  nameFr: string;
  ruleBook: string;
}

const AdminNewCyberFrame: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { ruleBooks, reloadCyberFrames } = useGlobalVars();

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

  const ruleBookSelect = useMemo(() => {
    return ruleBooks.map(({ ruleBook }) => ({
      value: ruleBook._id,
      // TODO : Handle Internationalization
      label: ruleBook.title,
      details: t(`ruleBookTypeNames.${ruleBook.type.name}`, { count: 1 }),
    }));
  }, [t, ruleBooks]);

  const onSaveCyberFrame: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, ruleBook }) => {
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

      api.cyberFrames
        .create({
          title: name,
          ruleBook,
          summary: html,
          i18n,
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
          navigate(`/admin/cyberframe/${cyberFrame._id}`);
        })
        .catch(({ response }) => {
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
    <div className="adminNewCyberFrame">
      <form
        className="adminNewCyberFrame__content"
        onSubmit={handleSubmit(onSaveCyberFrame)}
        noValidate
      >
        <Atitle level={1}>{t('adminNewCyberFrame.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewCyberFrame__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameCyberFrame.required', { ns: 'fields' }),
            }}
            label={t('nameCyberFrame.label', { ns: 'fields' })}
            className="adminNewCyberFrame__basics__name"
          />
          <SmartSelect
            control={control}
            inputName="ruleBook"
            rules={{
              required: t('linkedRuleBook.required', { ns: 'fields' }),
            }}
            label={t('linkedRuleBook.label', { ns: 'fields' })}
            options={ruleBookSelect}
            className="adminNewCyberFrame__basics__type"
          />
        </div>
        <div className="adminNewCyberFrame__details">
          <RichTextElement
            label={t('cyberFrameSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={''}
            small
            complete
          />
        </div>

        <Atitle className="adminNewCyberFrame__intl" level={2}>
          {t('adminNewCyberFrame.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewCyberFrame__intl-info">
          {t('adminNewCyberFrame.i18nInfo', { ns: 'pages' })}
        </Ap>
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
            label={`${t('cyberFrameSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent={''}
            small
            complete
          />
        </div>
        <Button type="submit">{t('adminNewCyberFrame.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewCyberFrame;
