import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useSystemAlerts } from '../../../providers';

import { Aa, Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';
import { type ICuratedSkillBranch } from '../../../types';

import './adminEditSkillBranch.scss';

interface FormValues {
  name: string;
  nameFr: string;
}

const AdminEditSkillBranch: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage?.() ?? {
    setConfirmContent: () => {},
    ConfMessageEvent: {},
  };
  const { id } = useParams();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [skillBranchData, seSkillBranchData] = useState<ICuratedSkillBranch | null>(null);

  const limitedMode = skillBranchData === null || skillBranchData?.skillBranch.title === '_general';

  const [skillBranchText, seSkillBranchText] = useState('');
  const [skillBranchTextFr, seSkillBranchTextFr] = useState('');

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const textFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const createDefaultData = useCallback((skillBranchData: ICuratedSkillBranch | null) => {
    if (skillBranchData == null) {
      return {};
    }
    const { skillBranch, i18n } = skillBranchData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = skillBranch.title;
    if (i18n.fr !== undefined) {
      defaultData.nameFr = i18n.fr.title ?? '';
    }
    return defaultData;
  }, []);

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: useMemo(
      () => createDefaultData(skillBranchData),
      [createDefaultData, skillBranchData]
    ),
  });

  const onSaveSkillBranch: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr }) => {
      if (textEditor === null || textFrEditor === null || api === undefined) {
        return;
      }
      const htmlText = textEditor.getHTML();
      const htmlTextFr = textFrEditor.getHTML();

      let i18n: any | null = null;

      if (nameFr !== '' || htmlTextFr !== '<p class="ap"></p>') {
        i18n = {
          fr: {
            title: nameFr,
            text: htmlTextFr,
          },
        };
      }

      api.skillBranches
        .update({
          id,
          title: name,
          summary: htmlText,
          i18n,
        })
        .then((skillBranch) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditSkillBranch.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
        })
        .catch(({ response }) => {
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
    [textEditor, textFrEditor, api, id, getNewId, createAlert, t, setError]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditSkillBranch.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditSkillBranch.confirmDeletion.text', {
          ns: 'pages',
          elt: skillBranchData?.skillBranch.title,
        }),
        confirmCta: t('adminEditSkillBranch.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const skillId =
          typeof skillBranchData?.skillBranch.skill === 'string'
            ? skillBranchData?.skillBranch.skill
            : skillBranchData?.skillBranch.skill?._id;
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.skillBranches
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditSkillBranch.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                navigate(`/admin/skill/${skillId}`);
              })
              .catch(({ response }) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.skillBranch.name`), 'capitalize'),
                    }),
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.skillBranch.name`), 'capitalize'),
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
    skillBranchData,
    ConfMessageEvent,
    id,
    getNewId,
    createAlert,
    navigate,
    setError,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.skillBranches
        .get({ skillBranchId: id })
        .then((curatedSkillBranch: ICuratedSkillBranch) => {
          const { skillBranch, i18n } = curatedSkillBranch;
          seSkillBranchData(curatedSkillBranch);
          seSkillBranchText(skillBranch.summary);
          if (i18n.fr !== undefined) {
            seSkillBranchTextFr(i18n.fr.summary ?? '');
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
      handleSubmit(onSaveSkillBranch)().then(
        () => {},
        () => {}
      );
    }, 600000);
    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveSkillBranch]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(skillBranchData));
  }, [skillBranchData, reset, createDefaultData]);

  return (
    <div className="adminEditSkillBranch">
      <form
        onSubmit={handleSubmit(onSaveSkillBranch)}
        noValidate
        className="adminEditSkillBranch__content"
      >
        <div className="adminEditSkillBranch__head">
          <Atitle level={1}>{t('adminEditSkillBranch.title', { ns: 'pages' })}</Atitle>
          <Button onClick={onAskDelete} color="error" disabled={limitedMode}>
            {t('adminEditSkillBranch.delete', { ns: 'pages' })}
          </Button>
        </div>
        <div className="adminEditSkillBranch__ariane">
          <Ap className="adminEditSkillBranch__ariane__elt">
            {`${t(`terms.skill.name`)}: `}
            <Aa
              href={`/admin/skill/${typeof skillBranchData?.skillBranch.skill === 'string' ? skillBranchData?.skillBranch.skill : skillBranchData?.skillBranch.skill._id}`}
            >
              {typeof skillBranchData?.skillBranch.skill !== 'string'
                ? skillBranchData?.skillBranch.skill.title
                : ''}
            </Aa>
          </Ap>
        </div>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror className="adminEditSkillBranch__error">{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditSkillBranch__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameSkillBranch.required', { ns: 'fields' }) }}
            label={t('nameSkillBranch.label', { ns: 'fields' })}
            className="adminEditSkillBranch__basics__name"
          />
        </div>
        <div className="adminEditSkillBranch__details">
          <RichTextElement
            label={t('skillBranchSummary.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={skillBranchText}
            small
          />
        </div>

        <Atitle className="adminEditSkillBranch__intl" level={2}>
          {t('adminEditSkillBranch.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminEditSkillBranch__intl-info">
          {t('adminEditSkillBranch.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminEditSkillBranch__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameSkillBranch.label', { ns: 'fields' })} (FR)`}
            className="adminEditSkillBranch__basics__name"
          />
        </div>
        <div className="adminEditSkillBranch__details">
          <RichTextElement
            label={`${t('skillBranchSummary.title', { ns: 'fields' })} (FR)`}
            editor={textFrEditor ?? undefined}
            rawStringContent={skillBranchTextFr}
            small
          />
        </div>
        <Button type="submit" disabled={limitedMode}>
          {t('adminEditSkillBranch.button', { ns: 'pages' })}
        </Button>
      </form>
    </div>
  );
};

export default AdminEditSkillBranch;
