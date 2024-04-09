import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useSystemAlerts } from '../../providers';

import { Aerror, Ali, Ap, Atitle, Aul } from '../../atoms';
import { Button, Input, SmartSelect, type ISingleValueSelect } from '../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../organisms';
import { type ICuratedSkill, type ICuratedSkillBranch, type ICuratedStat } from '../../types';

import { classTrim } from '../../utils';

import './adminEditSkill.scss';

interface FormValues {
  name: string;
  nameFr: string;
  stat: string;
}

const AdminEditSkill: FC = () => {
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

  const [stats, setStats] = useState<ISingleValueSelect[]>([]);

  const [skillData, setSkillData] = useState<ICuratedSkill | null>(null);

  const [skillText, setSkillText] = useState('');
  const [skillTextFr, setSkillTextFr] = useState('');

  const [skillBranches, setSkillBranches] = useState<ICuratedSkillBranch[] | null>(null);

  const textEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const textFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const skillBranchesList = useMemo(() => {
    if (skillBranches === null || skillBranches.length === 0) {
      return null;
    }
    return (
      <Aul className="adminEditSkill__skillbranch-list" noPoints>
        {skillBranches.map(({ skillBranch }) => (
          <Ali
            className={classTrim(`
              adminEditSkill__skillbranch-list__elt
            `)}
            key={skillBranch._id}
          >
            <Atitle level={3}>{skillBranch.title}</Atitle>
            <Button href={`/admin/skillbranch/${skillBranch._id}`}>
              {t('adminSkills.editSkill', { ns: 'pages' })}
            </Button>
          </Ali>
        ))}
      </Aul>
    );
  }, [skillBranches, t]);

  const createDefaultData = useCallback(
    (skillData: ICuratedSkill | null, stats: ISingleValueSelect[]) => {
      if (skillData == null) {
        return {};
      }
      const { skill, i18n } = skillData;
      const defaultData: Partial<FormValues> = {};
      defaultData.name = skill.title;
      const selectedfield = stats.find((statType) => statType.value === skill.stat._id);
      if (selectedfield !== undefined) {
        defaultData.stat = selectedfield.value;
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
    reset,
  } = useForm<FieldValues>({
    defaultValues: useMemo(
      () => createDefaultData(skillData, stats),
      [createDefaultData, stats, skillData]
    ),
  });

  const onSaveSkill: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, stat }) => {
      if (
        skillText === null ||
        skillTextFr === null ||
        textEditor === null ||
        textFrEditor === null ||
        api === undefined
      ) {
        return;
      }
      let htmlText: string | null = textEditor.getHTML();

      const htmlTextFr = textFrEditor.getHTML();

      if (htmlText === '<p class="ap"></p>') {
        htmlText = null;
      }

      let i18n: any | null = null;

      if (nameFr !== '' || htmlTextFr !== '<p class="ap"></p>') {
        i18n = {
          fr: {
            title: nameFr,
            text: htmlTextFr,
          },
        };
      }

      api.skills
        .update({
          id,
          title: name,
          stat,
          summary: htmlText,
          i18n,
        })
        .then((skill) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditSkill.successUpdate', { ns: 'pages' })}</Ap>
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
                field: i18next.format(t(`terms.skillType.${data.sent}`), 'capitalize'),
              }),
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.skillType.${data.sent}`), 'capitalize'),
              }),
            });
          }
        });
    },
    [skillText, skillTextFr, textEditor, textFrEditor, api, id, getNewId, createAlert, t, setError]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditSkill.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditSkill.confirmDeletion.text', {
          ns: 'pages',
          elt: skillData?.skill.title,
        }),
        confirmCta: t('adminEditSkill.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.skills
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditSkill.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                navigate('/admin/cyberframes');
              })
              .catch(({ response }) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.skill.name`), 'capitalize'),
                    }),
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.skill.name`), 'capitalize'),
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
    skillData?.skill.title,
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
      api.skills
        .get({ skillId: id })
        .then((curatedSkill: ICuratedSkill) => {
          const { skill, i18n } = curatedSkill;
          setSkillData(curatedSkill);
          setSkillText(skill.summary);
          if (i18n.fr !== undefined) {
            setSkillTextFr(i18n.fr.text ?? '');
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
      api.stats
        .getAll()
        .then((data: ICuratedStat[]) => {
          setStats(
            data.map(({ stat }) => ({
              value: stat._id,
              // TODO : Handle Internationalization
              label: stat.title,
            }))
          );
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
      api.skillBranches
        .getAllBySkill({ skillId: id })
        .then((curatedSkillBranches: ICuratedSkillBranch[]) => {
          setSkillBranches(curatedSkillBranches ?? []);
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
      handleSubmit(onSaveSkill)().then(
        () => {},
        () => {}
      );
    }, 300000);
    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveSkill]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(skillData, stats));
  }, [skillData, reset, createDefaultData, stats]);

  return (
    <div className="adminEditSkill">
      <form onSubmit={handleSubmit(onSaveSkill)} noValidate className="adminEditSkill__content">
        <div className="adminEditSkill__head">
          <Atitle level={1}>{skillData?.skill.title}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditSkill.delete', { ns: 'pages' })}
          </Button>
        </div>
        <div className="adminEditSkill__branches">
          <Atitle level={2}>{t('adminEditSkill.branches', { ns: 'pages' })}</Atitle>
          <div className="adminEditSkill__branches__list">{skillBranchesList}</div>
          <Button href={`/admin/skillbranch/new?skillId=${id}`}>
            {t('adminNewSkillBranch.title', { ns: 'pages' })}
          </Button>
        </div>
        <Atitle level={2}>{t('adminEditSkill.edit', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror className="adminEditSkill__error">{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditSkill__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameSkill.required', { ns: 'fields' }) }}
            label={t('nameSkill.label', { ns: 'fields' })}
            className="adminEditSkill__basics__name"
          />
          <SmartSelect
            control={control}
            inputName="stat"
            label={t('statSkill.label', { ns: 'fields' })}
            rules={{ required: t('statSkill.required', { ns: 'fields' }) }}
            options={stats}
            className="adminEditSkill__basics__stat"
          />
        </div>
        <div className="adminEditSkill__details">
          <RichTextElement
            label={t('skillText.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={skillText}
            small
          />
        </div>

        <Atitle className="adminEditSkill__intl" level={2}>
          {t('adminEditSkill.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminEditSkill__intl-info">
          {t('adminEditSkill.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminEditSkill__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameSkill.label', { ns: 'fields' })} (FR)`}
            className="adminEditSkill__basics__name"
          />
        </div>
        <div className="adminEditSkill__details">
          <RichTextElement
            label={`${t('skillText.title', { ns: 'fields' })} (FR)`}
            editor={textFrEditor ?? undefined}
            rawStringContent={skillTextFr}
            small
          />
        </div>
        <Button type="submit">{t('adminEditSkill.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditSkill;