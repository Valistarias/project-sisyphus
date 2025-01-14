import React, {
  useCallback, useEffect, useMemo, useRef, useState, type FC
} from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import {
  useForm, type FieldValues, type SubmitHandler
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useNavigate, useParams
} from 'react-router-dom';

import {
  useApi, useConfirmMessage, useGlobalVars, useSystemAlerts
} from '../../../providers';

import {
  Aerror, Ap, Atitle
} from '../../../atoms';
import {
  Button, Input, NodeTree, SmartSelect, type ISingleValueSelect
} from '../../../molecules';
import {
  Alert, RichTextElement, completeRichTextElementExtentions
} from '../../../organisms';

import type {
  ICuratedNode, ICuratedSkill, ISkillBranch
} from '../../../types';

import { classTrim } from '../../../utils';

import './adminEditSkill.scss';

interface FormValues {
  name: string
  nameFr: string
  stat: string
  formulaId: string
}

const AdminEditSkill: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const {
    stats, reloadSkills
  } = useGlobalVars();
  const confMessageEvt = useConfirmMessage();
  const { id } = useParams();
  const navigate = useNavigate();

  const calledApi = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const silentSave = useRef(false);

  const [displayInt, setDisplayInt] = useState(false);

  const [skillData, setSkillData] = useState<ICuratedSkill | null>(null);

  const [skillText, setSkillText] = useState('');
  const [skillTextFr, setSkillTextFr] = useState('');

  const textEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const textFrEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const nodeTree = useMemo(() => {
    const branches = skillData?.skill.branches;
    const tempTree: Record<
      string,
      {
        branch: ISkillBranch
        nodes: ICuratedNode[]
      }
    > = {};
    branches?.forEach(({ skillBranch }) => {
      tempTree[skillBranch._id] = {
        branch: skillBranch,
        nodes: skillBranch.nodes
      };
    });

    return Object.values(tempTree);
  }, [skillData]);

  const statSelect = useMemo<ISingleValueSelect[]>(
    () =>
      stats.map(({ stat }) => ({
        value: stat._id,
        // TODO : Handle Internationalization
        label: stat.title
      })),
    [stats]
  );

  const createDefaultData = useCallback(
    (skillData: ICuratedSkill | null, stats: ISingleValueSelect[]) => {
      if (skillData == null) {
        return {};
      }
      const {
        skill, i18n
      } = skillData;
      const defaultData: Partial<FormValues> = {};
      defaultData.name = skill.title;
      defaultData.formulaId = skill.formulaId;
      const selectedfield = stats.find(statType => statType.value === skill.stat._id);
      if (selectedfield !== undefined) {
        defaultData.stat = String(selectedfield.value);
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
    reset
  } = useForm({ defaultValues: useMemo(
    () => createDefaultData(skillData, statSelect),
    [
      createDefaultData,
      statSelect,
      skillData
    ]
  ) });

  const onSaveSkill: SubmitHandler<FormValues> = useCallback(
    ({
      name, nameFr, stat, formulaId
    }) => {
      if (textEditor === null || textFrEditor === null || formulaId === null || api === undefined) {
        return;
      }
      let htmlText: string | null = textEditor.getHTML();

      const htmlTextFr = textFrEditor.getHTML();

      if (htmlText === '<p class="ap"></p>') {
        htmlText = null;
      }

      let i18n: any | null = null;

      if (nameFr !== '' || htmlTextFr !== '<p class="ap"></p>') {
        i18n = { fr: {
          title: nameFr,
          text: htmlTextFr
        } };
      }

      api.skills
        .update({
          id,
          title: name,
          stat,
          formulaId,
          summary: htmlText,
          i18n
        })
        .then((skill) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditSkill.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          reloadSkills();
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: `${t(`serverErrors.${data.code}`, { field: 'Formula Id' })} by ${data.sent}`
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.charparamsType.${data.sent}`), 'capitalize') })
            });
          }
        });
    },
    [
      textEditor,
      textFrEditor,
      api,
      id,
      getNewId,
      createAlert,
      t,
      reloadSkills,
      setError
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || confMessageEvt === null) {
      return;
    }
    confMessageEvt.setConfirmContent(
      {
        title: t('adminEditSkill.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditSkill.confirmDeletion.text', {
          ns: 'pages',
          elt: skillData?.skill.title
        }),
        confirmCta: t('adminEditSkill.confirmDeletion.confirmCta', { ns: 'pages' })
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
                  )
                });
                reloadSkills();
                void navigate('/admin/skills');
              })
              .catch(({ response }) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.skill.name`), 'capitalize') })
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.skill.name`), 'capitalize') })
                  });
                }
              });
          }
          confMessageEvt.removeConfirmEventListener(evtId, confirmDelete);
        };
        confMessageEvt.addConfirmEventListener(evtId, confirmDelete);
      }
    );
  }, [
    api,
    confMessageEvt,
    t,
    skillData?.skill.title,
    id,
    getNewId,
    createAlert,
    reloadSkills,
    navigate,
    setError
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.skills
        .get({ skillId: id })
        .then((curatedSkill: ICuratedSkill) => {
          const {
            skill, i18n
          } = curatedSkill;
          setSkillData(curatedSkill);
          setSkillText(skill.summary);
          if (i18n.fr !== undefined) {
            setSkillTextFr(i18n.fr.summary ?? '');
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
            )
          });
        });
    }
  }, [
    api,
    createAlert,
    getNewId,
    id,
    t
  ]);

  // The Autosave
  useEffect(() => {
    saveTimer.current = setInterval(() => {
      silentSave.current = true;
      handleSubmit(onSaveSkill)().then(
        () => {},
        () => {}
      );
    }, 600000);

    return () => {
      if (saveTimer.current !== null) {
        clearInterval(saveTimer.current);
      }
    };
  }, [handleSubmit, onSaveSkill]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(skillData, statSelect));
  }, [
    skillData,
    reset,
    createDefaultData,
    statSelect
  ]);

  return (
    <div
      className={classTrim(`
        adminEditSkill
        ${displayInt ? 'adminEditSkill--int-visible' : ''}
      `)}
    >
      <form onSubmit={handleSubmit(onSaveSkill)} noValidate className="adminEditSkill__content">
        <div className="adminEditSkill__head">
          <Atitle level={1}>{skillData?.skill.title}</Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditSkill.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Button className="adminEditSkill__return-btn" href="/admin/skills" size="small">
          {t('adminEditSkill.return', { ns: 'pages' })}
        </Button>
        <Atitle level={2}>{t('adminEditSkill.edit', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror className="adminEditSkill__error">{errors.root.serverError.message}</Aerror>
            )
          : null}
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
            options={statSelect}
            className="adminEditSkill__basics__stat"
          />
        </div>
        <div className="adminEditSkill__details">
          <RichTextElement
            label={t('skillSummary.title', { ns: 'fields' })}
            editor={textEditor ?? undefined}
            rawStringContent={skillText}
            small
          />
          <Input
            control={control}
            inputName="formulaId"
            type="text"
            rules={{
              required: t('skillFormula.required', { ns: 'fields' }),
              pattern: {
                value: /^([a-z]){2,3}$/,
                message: t('skillFormula.format', { ns: 'fields' })
              }
            }}
            label={t('skillFormula.label', { ns: 'fields' })}
          />
        </div>
        <div className="adminEditSkill__intl-title">
          <div className="adminEditSkill__intl-title__content">
            <Atitle className="adminEditSkill__intl-title__title" level={2}>
              {t('adminEditSkill.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditSkill__intl-title__info">
              {t('adminEditSkill.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt(prev => !prev);
            }}
            className="adminEditSkill__intl-title__btn"
          />
        </div>
        <div className="adminEditSkill__intl">
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
              label={`${t('skillSummary.title', { ns: 'fields' })} (FR)`}
              editor={textFrEditor ?? undefined}
              rawStringContent={skillTextFr}
              small
            />
          </div>
        </div>
        <div className="adminEditSkill__nodes">
          <Atitle level={2}>{t('adminEditSkill.nodes', { ns: 'pages' })}</Atitle>
          <div className="adminEditSkill__nodes__list">
            <NodeTree
              tree={nodeTree}
              onNodeClick={(id) => {
                void navigate(`/admin/node/${id}`);
              }}
              isAdmin
            />
          </div>
          <div className="adminEditSkill__nodes__btns">
            <Button href={`/admin/node/new?skillId=${id}`}>
              {t('adminNewNode.title', { ns: 'pages' })}
            </Button>
            <Button href={`/admin/skillbranch/new?skillId=${id}`}>
              {t('adminNewSkillBranch.title', { ns: 'pages' })}
            </Button>
          </div>
        </div>
        <Button type="submit">{t('adminEditSkill.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditSkill;
