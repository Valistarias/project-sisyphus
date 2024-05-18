import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aa, Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input, NodeIconSelect, SmartSelect } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';
import {
  type ICuratedCyberFrame,
  type ICuratedCyberFrameBranch,
  type ICuratedNode,
  type ICuratedSkill,
  type ICuratedSkillBranch,
  type ISkillBranch,
} from '../../../types';

import { classTrim, isThereDuplicate } from '../../../utils';

import './adminEditNode.scss';

interface FormValues {
  name: string;
  nameFr: string;
  quote: string;
  quoteFr: string;
  rank: number;
  icon: string;
  branch: string;
  skillBonuses?: Record<
    string,
    {
      skill: string;
      value: number;
    }
  >;
  statBonuses?: Record<
    string,
    {
      stat: string;
      value: number;
    }
  >;
  charParamBonuses?: Record<
    string,
    {
      charParam: string;
      value: number;
    }
  >;
  effects?: Record<
    string,
    {
      id: string;
      title: string;
      titleFr?: string;
      summary: string;
      summaryFr?: string;
      type: string;
      formula?: string;
    }
  >;
  actions?: Record<
    string,
    {
      id: string;
      title: string;
      titleFr?: string;
      summary: string;
      summaryFr?: string;
      type: string;
      skill?: string;
      duration: string;
      time?: string;
      timeFr?: string;
      damages?: string;
      offsetSkill?: string;
      uses?: number;
      isKarmic?: string;
      karmicCost?: number;
    }
  >;
}

const generalRange = [...Array(2)].map((_, i) => ({
  value: i + 1,
  label: String(i + 1),
}));

const branchRange = [...Array(8)].map((_, i) => ({
  value: i + 3,
  label: String(i + 3),
}));

const AdminEditNode: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { id } = useParams();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage?.() ?? {
    setConfirmContent: () => {},
    ConfMessageEvent: {},
  };
  const {
    skills,
    stats,
    charParams,
    actionTypes,
    actionDurations,
    reloadSkills,
    reloadCyberFrames,
  } = useGlobalVars();
  const { createAlert, getNewId } = useSystemAlerts();
  const navigate = useNavigate();

  const [displayInt, setDisplayInt] = useState(false);

  // Selected element via ID in url
  const [skill, setSkill] = useState<ICuratedSkill | null>(null);
  const [cyberFrame, setCyberFrame] = useState<ICuratedCyberFrame | null>(null);

  // General elements, for bonuses
  const skillSelect = useMemo(
    () =>
      skills.map(({ skill }) => ({
        value: skill._id,
        // TODO : Handle Internationalization
        label: skill.title,
      })),
    [skills]
  );
  const [skillBonusIds, setSkillBonusIds] = useState<number[]>([]);
  const idIncrement = useRef(0);

  const statSelect = useMemo(
    () =>
      stats.map(({ stat }) => ({
        value: stat._id,
        // TODO : Handle Internationalization
        label: stat.title,
      })),
    [stats]
  );
  const [statBonusIds, setStatBonusIds] = useState<number[]>([]);

  const charParamSelect = useMemo(
    () =>
      charParams.map(({ charParam }) => ({
        value: charParam._id,
        // TODO : Handle Internationalization
        label: charParam.title,
      })),
    [charParams]
  );
  const [charParamBonusIds, setCharParamBonusIds] = useState<number[]>([]);

  const [branches, setBranches] = useState<ICuratedSkillBranch[] | ICuratedCyberFrameBranch[]>([]);

  const [rankSelect, setLevelSelect] = useState<
    Array<{
      value: number;
      label: string;
    }>
  >([]);

  const actionTypeSelect = useMemo(
    () =>
      actionTypes.map(({ name, _id }) => ({
        value: _id,
        label: t(`terms.actionType.${name}`),
      })),
    [actionTypes, t]
  );

  const actionDurationSelect = useMemo(
    () =>
      actionDurations.map(({ name, _id }) => ({
        value: _id,
        label: t(`terms.actionDuration.${name}`),
      })),
    [actionDurations, t]
  );

  const [effectIds, setEffectIds] = useState<number[]>([]);

  const [actionIds, setActionIds] = useState<number[]>([]);

  const calledApi = useRef(false);

  const [nodeData, setNodeData] = useState<ICuratedNode | null>(null);

  const [nodeText, setNodeText] = useState('');
  const [nodeTextFr, setNodeTextFr] = useState('');

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const createDefaultData = useCallback((nodeData: ICuratedNode | null) => {
    if (nodeData == null) {
      return {};
    }
    const { node, i18n } = nodeData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = node.title;
    defaultData.quote = node.quote;
    defaultData.rank = node.rank;
    defaultData.icon = node.icon;
    if (node.skillBranch !== undefined && typeof node.skillBranch !== 'string') {
      defaultData.branch = node.skillBranch._id;
    } else if (node.cyberFrameBranch !== undefined && typeof node.cyberFrameBranch !== 'string') {
      defaultData.branch = node.cyberFrameBranch._id;
    }
    if (i18n.fr !== undefined) {
      defaultData.nameFr = i18n.fr.title ?? '';
      defaultData.quoteFr = i18n.fr.quote ?? '';
    }

    // Init Bonus Skill
    const tempSkillBonusId: number[] = [];
    node.skillBonuses?.forEach((skillBonus) => {
      if (defaultData.skillBonuses === undefined) {
        defaultData.skillBonuses = {};
      }
      defaultData.skillBonuses[`skill-${idIncrement.current}`] = {
        skill: skillBonus.skill,
        value: skillBonus.value,
      };

      tempSkillBonusId.push(idIncrement.current);
      idIncrement.current += 1;
    });
    setSkillBonusIds(tempSkillBonusId);

    // Init Bonus Stat
    const tempStatBonusId: number[] = [];
    node.statBonuses?.forEach((statBonus) => {
      if (defaultData.statBonuses === undefined) {
        defaultData.statBonuses = {};
      }
      defaultData.statBonuses[`stat-${idIncrement.current}`] = {
        stat: statBonus.stat,
        value: statBonus.value,
      };

      tempStatBonusId.push(idIncrement.current);
      idIncrement.current += 1;
    });
    setStatBonusIds(tempStatBonusId);

    // Init Bonus CharParam
    const tempCharParamBonusId: number[] = [];
    node.charParamBonuses?.forEach((charParamBonus) => {
      if (defaultData.charParamBonuses === undefined) {
        defaultData.charParamBonuses = {};
      }
      defaultData.charParamBonuses[`charParam-${idIncrement.current}`] = {
        charParam: charParamBonus.charParam,
        value: charParamBonus.value,
      };

      tempCharParamBonusId.push(idIncrement.current);
      idIncrement.current += 1;
    });
    setCharParamBonusIds(tempCharParamBonusId);

    // Init Actions
    const tempActionId: number[] = [];
    node.actions?.forEach((action) => {
      if (defaultData.actions === undefined) {
        defaultData.actions = {};
      }
      defaultData.actions[`action-${idIncrement.current}`] = {
        id: action._id,
        title: action.title,
        type: action.type,
        duration: action.duration,
        ...(action.skill !== undefined ? { skill: action.skill } : {}),
        ...(action.damages !== undefined ? { damages: action.damages } : {}),
        ...(action.offsetSkill !== undefined ? { offsetSkill: action.offsetSkill } : {}),
        ...(action.uses !== undefined ? { uses: action.uses } : {}),
        ...(action.isKarmic !== undefined ? { isKarmic: action.isKarmic ? '1' : '0' } : {}),
        ...(action.karmicCost !== undefined ? { karmicCost: action.karmicCost } : {}),
        ...(action.time !== undefined ? { time: action.time } : {}),
        summary: action.summary,
        titleFr: action.i18n?.fr?.title,
        summaryFr: action.i18n?.fr?.summary,
        timeFr: action.i18n?.fr?.time,
      };

      tempActionId.push(idIncrement.current);
      idIncrement.current += 1;
    });
    setActionIds(tempActionId);

    // Init Effects
    const tempEffectId: number[] = [];
    node.effects?.forEach((effect) => {
      if (defaultData.effects === undefined) {
        defaultData.effects = {};
      }
      defaultData.effects[`effect-${idIncrement.current}`] = {
        id: effect._id,
        title: effect.title,
        type: effect.type,
        formula: effect.formula,
        summary: effect.summary,
        titleFr: effect.i18n?.fr?.title,
        summaryFr: effect.i18n?.fr?.summary,
      };

      tempEffectId.push(idIncrement.current);
      idIncrement.current += 1;
    });
    setEffectIds(tempEffectId);

    return defaultData;
  }, []);

  const {
    handleSubmit,
    setError,
    setValue,
    unregister,
    control,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: useMemo(() => createDefaultData(nodeData), [createDefaultData, nodeData]),
  });

  const boolRange = useMemo(
    () => [
      {
        value: '1',
        label: t('terms.general.yes'),
      },
      {
        value: '0',
        label: t('terms.general.no'),
      },
    ],
    [t]
  );

  const branchSelect = useMemo(() => {
    return branches.reduce(
      (
        result: Array<{
          value: string;
          label: string;
        }>,
        elt: ICuratedSkillBranch | ICuratedCyberFrameBranch
      ) => {
        if (elt !== undefined) {
          const relevantElt =
            (elt as ICuratedCyberFrameBranch).cyberFrameBranch ??
            (elt as ICuratedSkillBranch).skillBranch;
          result.push({
            value: relevantElt._id,
            // TODO : Handle Internationalization
            label:
              relevantElt.title === '_general' ? t('terms.node.generalBranch') : relevantElt.title,
          });
        }
        return result;
      },
      []
    );
  }, [branches, t]);

  const onAddSkillBonus = useCallback(() => {
    setSkillBonusIds((prev) => {
      const next = [...prev];
      next.push(idIncrement.current);
      idIncrement.current += 1;
      return next;
    });
  }, []);

  const onAddStatBonus = useCallback(() => {
    setStatBonusIds((prev) => {
      const next = [...prev];
      next.push(idIncrement.current);
      idIncrement.current += 1;
      return next;
    });
  }, []);

  const onAddCharParamBonus = useCallback(() => {
    setCharParamBonusIds((prev) => {
      const next = [...prev];
      next.push(idIncrement.current);
      idIncrement.current += 1;
      return next;
    });
  }, []);

  const onAddAction = useCallback(() => {
    setActionIds((prev) => {
      const next = [...prev];
      next.push(idIncrement.current);
      idIncrement.current += 1;
      return next;
    });
  }, []);

  const onAddEffect = useCallback(() => {
    setEffectIds((prev) => {
      const next = [...prev];
      next.push(idIncrement.current);
      idIncrement.current += 1;
      return next;
    });
  }, []);

  const onSaveNode: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, quote, quoteFr, rank, icon, branch, effects, actions, ...elts }) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }
      // Check duplicate on skills
      const skillBonuses = elts.skillBonuses !== undefined ? Object.values(elts.skillBonuses) : [];
      let duplicateSkillBonuses = false;
      if (skillBonuses.length > 0) {
        duplicateSkillBonuses = isThereDuplicate(
          skillBonuses.map((skillBonus) => skillBonus.skill)
        );
      }
      if (duplicateSkillBonuses) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminEditNode.errorDuplicateSkill', { ns: 'pages' }),
        });
        return;
      }
      // Check duplicate on stats
      const statBonuses = elts.statBonuses !== undefined ? Object.values(elts.statBonuses) : [];
      let duplicateStatBonuses = false;
      if (statBonuses.length > 0) {
        duplicateStatBonuses = isThereDuplicate(statBonuses.map((statBonus) => statBonus.stat));
      }
      if (duplicateStatBonuses) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminEditNode.errorDuplicateStat', { ns: 'pages' }),
        });
        return;
      }
      // Check duplicate on character param
      const charParamBonuses =
        elts.charParamBonuses !== undefined ? Object.values(elts.charParamBonuses) : [];
      let duplicateCharParamBonuses = false;
      if (charParamBonuses.length > 0) {
        duplicateCharParamBonuses = isThereDuplicate(
          charParamBonuses.map((charParamBonus) => charParamBonus.charParam)
        );
      }
      if (duplicateCharParamBonuses) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminEditNode.errorDuplicateCharParam', { ns: 'pages' }),
        });
        return;
      }
      const skillId = (nodeData?.node.skillBranch as ISkillBranch)?._id;
      const curatedSkillBonuses = skillBonuses.map(({ skill, value }) => ({
        skill,
        value: Number(value),
      }));
      const curatedStatBonuses = statBonuses.map(({ stat, value }) => ({
        stat,
        value: Number(value),
      }));
      const curatedCharParamBonuses = charParamBonuses.map(({ charParam, value }) => ({
        charParam,
        value: Number(value),
      }));

      const effectsArr = effects !== undefined ? Object.values(effects) : [];
      const curatedEffects = effectsArr.map(
        ({ id, formula, type, title, summary, titleFr, summaryFr }) => ({
          ...(id !== undefined ? { id } : {}),
          title,
          summary,
          formula,
          type,
          i18n: {
            ...(titleFr !== undefined || summaryFr !== undefined
              ? {
                  fr: {
                    title: titleFr,
                    summary: summaryFr,
                  },
                }
              : {}),
          },
        })
      );

      const actionsArr = actions !== undefined ? Object.values(actions) : [];
      const curatedActions = actionsArr.map(
        ({
          id,
          title,
          summary,
          titleFr,
          skill,
          duration,
          type,
          time,
          timeFr,
          damages,
          offsetSkill,
          uses,
          isKarmic,
          karmicCost,
          summaryFr,
        }) => ({
          ...(id !== undefined ? { id } : {}),
          title,
          summary,
          skill,
          duration,
          damages,
          offsetSkill,
          isKarmic: String(isKarmic) === '1',
          karmicCost,
          uses,
          time,
          type,
          i18n: {
            ...(titleFr !== undefined || summaryFr !== undefined || timeFr !== undefined
              ? {
                  fr: {
                    title: titleFr,
                    summary: summaryFr,
                    time: timeFr,
                  },
                }
              : {}),
          },
        })
      );

      let html: string | null = introEditor.getHTML();
      const htmlFr = introFrEditor.getHTML();
      if (html === '<p class="ap"></p>') {
        html = null;
      }
      let i18n: any | null = null;
      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>' || quoteFr !== '') {
        i18n = {
          fr: {
            title: nameFr,
            summary: htmlFr,
            quote: quoteFr,
          },
        };
      }
      api.nodes
        .update({
          id,
          title: name,
          ...(skillId !== undefined ? { skillBranch: branch } : { cyberFrameBranch: branch }),
          summary: html,
          rank: Number(rank),
          icon,
          quote,
          i18n,
          skillBonuses: curatedSkillBonuses,
          statBonuses: curatedStatBonuses,
          charParamBonuses: curatedCharParamBonuses,
          effects: curatedEffects,
          actions: curatedActions,
        })
        .then((quote) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditNode.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          if (skillId !== undefined) {
            reloadSkills();
          } else {
            reloadCyberFrames();
          }
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.quoteType.${data.sent}`), 'capitalize'),
              }),
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.quoteType.${data.sent}`), 'capitalize'),
              }),
            });
          }
        });
    },
    [
      introEditor,
      introFrEditor,
      api,
      nodeData?.node.skillBranch,
      id,
      setError,
      t,
      getNewId,
      createAlert,
      reloadSkills,
      reloadCyberFrames,
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || nodeData === null) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditNode.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditNode.confirmDeletion.text', {
          ns: 'pages',
          elt: nodeData?.node.title,
        }),
        confirmCta: t('adminEditNode.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const { node } = nodeData;
        const route = node.skillBranch !== undefined ? 'skill' : 'cyberframe';
        let routeId: string;
        if (node.skillBranch !== undefined && typeof node.skillBranch !== 'string') {
          routeId = node.skillBranch.skill as string;
        } else if (
          node.cyberFrameBranch !== undefined &&
          typeof node.cyberFrameBranch !== 'string'
        ) {
          routeId = node.cyberFrameBranch.cyberFrame as string;
        }
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.nodes
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditNode.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                navigate(`/admin/${route}/${routeId}`);
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
    nodeData,
    setConfirmContent,
    t,
    ConfMessageEvent,
    id,
    getNewId,
    createAlert,
    navigate,
    setError,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current && skills.length !== 0) {
      calledApi.current = true;
      api.nodes
        .get({ nodeId: id })
        .then((curatedNode: ICuratedNode) => {
          const { node, i18n } = curatedNode;
          setNodeData(curatedNode);
          setNodeText(node.summary);
          if (i18n.fr !== undefined) {
            setNodeTextFr(i18n.fr.summary ?? '');
          }
          let titleBranch = '';
          if (node.skillBranch !== undefined && typeof node.skillBranch !== 'string') {
            titleBranch = node.skillBranch.title;
          } else if (
            node.cyberFrameBranch !== undefined &&
            typeof node.cyberFrameBranch !== 'string'
          ) {
            titleBranch = node.cyberFrameBranch.title;
          }
          if (titleBranch === '_general') {
            setLevelSelect(generalRange);
          } else {
            setLevelSelect(branchRange);
          }
          if (node.skillBranch !== undefined && typeof node.skillBranch !== 'string') {
            const skillId = String(node.skillBranch.skill);
            api.skills
              .get({
                skillId,
              })
              .then((curatedSkill: ICuratedSkill) => {
                setSkill(curatedSkill);
                setBranches(curatedSkill.skill.branches ?? []);
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
          } else if (
            node.cyberFrameBranch !== undefined &&
            typeof node.cyberFrameBranch !== 'string'
          ) {
            const cyberFrameId = String(node.cyberFrameBranch.cyberFrame);
            api.cyberFrames
              .get({
                cyberFrameId,
              })
              .then((sentCyberFrame: ICuratedCyberFrame) => {
                setCyberFrame(sentCyberFrame);
                setBranches(sentCyberFrame.cyberFrame.branches ?? []);
              })
              .catch(() => {
                // setLoading(false);
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
          if (node.skillBranch !== undefined && typeof node.skillBranch !== 'string') {
            const foundSkill = skills.find(
              ({ skill }) => skill._id === String((node.skillBranch as ISkillBranch)?.skill)
            );
            if (foundSkill !== undefined) {
              setSkill(foundSkill);
            }
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
  }, [api, createAlert, getNewId, skills, id, t]);

  useEffect(() => {
    if (rankSelect.length > 0) {
      setValue('rank', rankSelect[0].value);
    }
  }, [rankSelect, setValue]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(nodeData));
  }, [nodeData, reset, createDefaultData]);

  return (
    <div
      className={classTrim(`
        adminEditNode
        ${displayInt ? 'adminEditNode--int-visible' : ''}
      `)}
    >
      <form className="adminEditNode__content" onSubmit={handleSubmit(onSaveNode)} noValidate>
        <div className="adminEditNode__head">
          <Atitle className="adminEditNode__head" rank={1}>
            {t('adminEditNode.title', { ns: 'pages' })}
          </Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditNode.delete', { ns: 'pages' })}
          </Button>
        </div>
        <div className="adminEditNode__ariane">
          <Ap className="adminEditNode__ariane__elt">
            {skill !== null ? (
              <>
                {`${t(`terms.skill.name`)}:`}
                <Aa href={`/admin/skill/${skill?.skill._id}`}>{skill?.skill.title}</Aa>
              </>
            ) : (
              <>
                {`${t(`terms.cyberFrame.name`)}:`}
                <Aa href={`/admin/cyberframe/${cyberFrame?.cyberFrame._id}`}>
                  {cyberFrame?.cyberFrame.title}
                </Aa>
              </>
            )}
          </Ap>
        </div>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditNode__visual">
          <NodeIconSelect
            label={t('iconNode.label', { ns: 'fields' })}
            control={control}
            inputName="icon"
            rules={{
              required: t('iconNode.required', { ns: 'fields' }),
            }}
          />
        </div>
        <div className="adminEditNode__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameNode.required', { ns: 'fields' }),
            }}
            label={t('nameNode.label', { ns: 'fields' })}
            className="adminEditNode__basics__name"
          />
          <SmartSelect
            control={control}
            inputName="branch"
            rules={{
              required: t('branchNode.required', { ns: 'fields' }),
            }}
            label={t('branchNode.label', { ns: 'fields' })}
            options={branchSelect}
            onChange={(e) => {
              let titleBranch: string | null = null;
              branches.forEach((elt: ICuratedSkillBranch | ICuratedCyberFrameBranch) => {
                const relevantElt =
                  (elt as ICuratedCyberFrameBranch).cyberFrameBranch ??
                  (elt as ICuratedSkillBranch).skillBranch;
                if (relevantElt !== undefined && relevantElt._id === e) {
                  titleBranch = relevantElt.title;
                }
              });
              if (titleBranch === '_general') {
                setLevelSelect(generalRange);
              } else {
                setLevelSelect(branchRange);
              }
            }}
            className="adminEditNode__basics__type"
          />
          <SmartSelect
            control={control}
            placeholder={'0'}
            inputName="rank"
            rules={{
              required: t('rankNode.required', { ns: 'fields' }),
            }}
            label={t('rankNode.label', { ns: 'fields' })}
            options={rankSelect}
            className="adminEditNode__basics__rank"
            disabled={rankSelect.length === 0}
          />
        </div>
        <div className="adminEditNode__details">
          <RichTextElement
            label={t('nodeSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={nodeText}
            small
            complete
          />
          <Input
            control={control}
            inputName="quote"
            type="text"
            label={t('quoteNode.label', { ns: 'fields' })}
            className="adminEditNode__details__quote"
          />
        </div>
        <Atitle className="adminEditNode__bonus-title" level={2}>
          {t('adminEditNode.values', { ns: 'pages' })}
        </Atitle>
        <div className="adminEditNode__bonuses">
          <div className="adminEditNode__bonuses__elts">
            {skillBonusIds.map((skillBonusId) => (
              <div className="adminEditNode__bonus" key={`skill-${skillBonusId}`}>
                <Atitle className="adminEditNode__bonus__title" level={4}>
                  {t('adminEditNode.skillBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditNode__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.skill`}
                    rules={{
                      required: t('skillBonusSkill.required', { ns: 'fields' }),
                    }}
                    label={t('skillBonusSkill.label', { ns: 'fields' })}
                    options={skillSelect}
                    className="adminEditNode__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.value`}
                    type="number"
                    rules={{
                      required: t('skillBonusValue.required', { ns: 'fields' }),
                    }}
                    label={t('skillBonusValue.label', { ns: 'fields' })}
                    className="adminEditNode__bonus__value"
                  />
                </div>
                <Button
                  icon="delete"
                  theme="afterglow"
                  onClick={() => {
                    setSkillBonusIds((prev) =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== skillBonusId) {
                          result.push(elt);
                        }
                        return result;
                      }, [])
                    );
                    unregister(`skillBonuses.skill-${skillBonusId}`);
                  }}
                  className="adminEditNode__bonus__button"
                />
              </div>
            ))}
            {statBonusIds.map((statBonusId) => (
              <div className="adminEditNode__bonus" key={`stat-${statBonusId}`}>
                <Atitle className="adminEditNode__bonus__title" level={4}>
                  {t('adminEditNode.statBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditNode__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.stat`}
                    rules={{
                      required: t('statBonusStat.required', { ns: 'fields' }),
                    }}
                    label={t('statBonusStat.label', { ns: 'fields' })}
                    options={statSelect}
                    className="adminEditNode__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.value`}
                    type="number"
                    rules={{
                      required: t('statBonusValue.required', { ns: 'fields' }),
                    }}
                    label={t('statBonusValue.label', { ns: 'fields' })}
                    className="adminEditNode__bonus__value"
                  />
                </div>
                <Button
                  icon="delete"
                  theme="afterglow"
                  onClick={() => {
                    setStatBonusIds((prev) =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== statBonusId) {
                          result.push(elt);
                        }
                        return result;
                      }, [])
                    );
                    unregister(`statBonuses.stat-${statBonusId}`);
                  }}
                  className="adminEditNode__bonus__button"
                />
              </div>
            ))}
            {charParamBonusIds.map((charParamBonusId) => (
              <div className="adminEditNode__bonus" key={`charParam-${charParamBonusId}`}>
                <Atitle className="adminEditNode__bonus__title" level={4}>
                  {t('adminEditNode.charParamBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditNode__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`charParamBonuses.charParam-${charParamBonusId}.charParam`}
                    rules={{
                      required: t('charParamBonusStat.required', { ns: 'fields' }),
                    }}
                    label={t('charParamBonusStat.label', { ns: 'fields' })}
                    options={charParamSelect}
                    className="adminEditNode__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`charParamBonuses.charParam-${charParamBonusId}.value`}
                    type="number"
                    rules={{
                      required: t('charParamBonusValue.required', { ns: 'fields' }),
                    }}
                    label={t('charParamBonusValue.label', { ns: 'fields' })}
                    className="adminEditNode__bonus__value"
                  />
                </div>
                <Button
                  icon="delete"
                  theme="afterglow"
                  onClick={() => {
                    setCharParamBonusIds((prev) =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== charParamBonusId) {
                          result.push(elt);
                        }
                        return result;
                      }, [])
                    );
                    unregister(`charParamBonuses.charParam-${charParamBonusId}`);
                  }}
                  className="adminEditNode__bonus__button"
                />
              </div>
            ))}
            {effectIds.map((effectId) => (
              <div className="adminEditNode__bonus" key={`charParam-${effectId}`}>
                <Atitle className="adminEditNode__bonus__title" level={4}>
                  {t('adminEditNode.effectTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditNode__bonus__fields adminEditNode__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.title`}
                    rules={{
                      required: t('effectTitle.required', { ns: 'fields' }),
                    }}
                    label={t('effectTitle.label', { ns: 'fields' })}
                    className="adminEditNode__bonus__value adminEditNode__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`effects.effect-${effectId}.type`}
                    rules={{
                      required: t('effectType.required', { ns: 'fields' }),
                    }}
                    label={t('effectType.label', { ns: 'fields' })}
                    options={actionTypeSelect}
                    className="adminEditNode__bonus__select adminEditNode__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`effects.effect-${effectId}.summary`}
                    rules={{
                      required: t('effectSummary.required', { ns: 'fields' }),
                    }}
                    label={t('effectSummary.label', { ns: 'fields' })}
                    className="adminEditNode__bonus__value adminEditNode__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.formula`}
                    label={t('effectFormula.label', { ns: 'fields' })}
                    className="adminEditNode__bonus__value adminEditNode__bonus__value--l"
                  />
                  <Atitle className="adminEditNode__bonus__title" level={4}>
                    {t('adminEditNode.effectInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.titleFr`}
                    label={`${t('effectTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminEditNode__bonus__value adminEditNode__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`effects.effect-${effectId}.summaryFr`}
                    label={`${t('effectSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminEditNode__bonus__value adminEditNode__bonus__value--l"
                  />
                </div>
                <Button
                  icon="delete"
                  theme="afterglow"
                  onClick={() => {
                    setEffectIds((prev) =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== effectId) {
                          result.push(elt);
                        }
                        return result;
                      }, [])
                    );
                    unregister(`effects.effect-${effectId}`);
                  }}
                  className="adminEditNode__bonus__button"
                />
              </div>
            ))}
            {actionIds.map((actionId) => (
              <div className="adminEditNode__bonus" key={`charParam-${actionId}`}>
                <Atitle className="adminEditNode__bonus__title" level={4}>
                  {t('adminEditNode.actionTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditNode__bonus__fields adminEditNode__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.title`}
                    rules={{
                      required: t('actionTitle.required', { ns: 'fields' }),
                    }}
                    label={t('actionTitle.label', { ns: 'fields' })}
                    className="adminEditNode__bonus__value adminEditNode__bonus__value--l"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.type`}
                    rules={{
                      required: t('actionType.required', { ns: 'fields' }),
                    }}
                    label={t('actionType.label', { ns: 'fields' })}
                    options={actionTypeSelect}
                    className="adminEditNode__bonus__select adminEditNode__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.duration`}
                    rules={{
                      required: t('actionDuration.required', { ns: 'fields' }),
                    }}
                    label={t('actionDuration.label', { ns: 'fields' })}
                    options={actionDurationSelect}
                    className="adminEditNode__bonus__select adminEditNode__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`actions.action-${actionId}.summary`}
                    rules={{
                      required: t('actionSummary.required', { ns: 'fields' }),
                    }}
                    label={t('actionSummary.label', { ns: 'fields' })}
                    className="adminEditNode__bonus__value adminEditNode__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.time`}
                    label={t('actionTime.label', { ns: 'fields' })}
                    className="adminEditNode__bonus__value adminEditNode__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.damages`}
                    label={t('actionDamages.label', { ns: 'fields' })}
                    className="adminEditNode__bonus__value adminEditNode__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.skill`}
                    label={t('actionSkill.label', { ns: 'fields' })}
                    options={[
                      {
                        value: '',
                        label: '',
                      },
                      ...skillSelect,
                    ]}
                    className="adminEditNode__bonus__select adminEditNode__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.offsetSkill`}
                    label={t('actionOffsetSkill.label', { ns: 'fields' })}
                    className="adminEditNode__bonus__value adminEditNode__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.isKarmic`}
                    label={t('actionIsKarmic.label', { ns: 'fields' })}
                    options={boolRange}
                    className="adminEditNode__bonus__select adminEditNode__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="number"
                    inputName={`actions.action-${actionId}.karmicCost`}
                    label={t('actionKarmicCost.label', { ns: 'fields' })}
                    className="adminEditNode__bonus__value adminEditNode__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="number"
                    inputName={`actions.action-${actionId}.uses`}
                    label={t('actionUses.label', { ns: 'fields' })}
                    className="adminEditNode__bonus__value adminEditNode__bonus__value--l"
                  />
                  <Atitle className="adminEditNode__bonus__title" level={4}>
                    {t('adminEditNode.actionInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.titleFr`}
                    label={`${t('actionTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminEditNode__bonus__value adminEditNode__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`actions.action-${actionId}.summaryFr`}
                    label={`${t('actionSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminEditNode__bonus__value adminEditNode__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.timeFr`}
                    label={`${t('actionTime.label', { ns: 'fields' })} (FR)`}
                    className="adminEditNode__bonus__value adminEditNode__bonus__value--l"
                  />
                </div>
                <Button
                  icon="delete"
                  theme="afterglow"
                  onClick={() => {
                    setActionIds((prev) =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== actionId) {
                          result.push(elt);
                        }
                        return result;
                      }, [])
                    );
                    unregister(`actions.action-${actionId}`);
                  }}
                  className="adminEditNode__bonus__button"
                />
              </div>
            ))}
          </div>
          <div className="adminEditNode__bonuses__buttons">
            <Button onClick={onAddSkillBonus}>
              {t('adminEditNode.createSkillBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddStatBonus}>
              {t('adminEditNode.createStatBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddCharParamBonus}>
              {t('adminEditNode.createCharParamBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddAction}>
              {t('adminEditNode.createActionButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddEffect}>
              {t('adminEditNode.createEffectButton', { ns: 'pages' })}
            </Button>
          </div>
        </div>
        <div className="adminEditNode__intl-title">
          <div className="adminEditNode__intl-title__content">
            <Atitle className="adminEditNode__intl-title__title" level={2}>
              {t('adminEditNode.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditNode__intl-title__info">
              {t('adminEditNode.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt((prev) => !prev);
            }}
            className="adminEditNode__intl-title__btn"
          />
        </div>
        <div className="adminEditNode__intl">
          <div className="adminEditNode__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameNode.label', { ns: 'fields' })} (FR)`}
              className="adminEditNode__basics__name"
            />
          </div>
          <div className="adminEditNode__details">
            <RichTextElement
              label={`${t('nodeSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent={nodeTextFr}
              small
              complete
            />
            <Input
              control={control}
              inputName="quoteFr"
              type="text"
              label={`${t('quoteNode.label', { ns: 'fields' })} (FR)`}
              className="adminEditNode__details__quote"
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditNode.createButton', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditNode;
