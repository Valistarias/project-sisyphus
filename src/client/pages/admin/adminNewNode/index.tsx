import React, {
  useCallback, useEffect, useMemo, useRef, useState, type FC
} from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import {
  useForm, type SubmitHandler
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  useLocation, useNavigate
} from 'react-router-dom';

import {
  useApi, useGlobalVars, useSystemAlerts
} from '../../../providers';

import {
  Aa, Aerror, Ap, Atitle
} from '../../../atoms';
import {
  Button, Input, NodeIconSelect, SmartSelect
} from '../../../molecules';
import {
  Alert, RichTextElement, completeRichTextElementExtentions
} from '../../../organisms';

import type {
  ICuratedCyberFrame,
  ICuratedCyberFrameBranch,
  ICuratedSkill,
  ICuratedSkillBranch
} from '../../../types';
import type { ErrorResponseType, InternationalizationType } from '../../../types/global';

import {
  classTrim, isThereDuplicate
} from '../../../utils';

import './adminNewNode.scss';

interface FormValues {
  name: string
  nameFr: string
  quote: string
  quoteFr: string
  rank: number
  icon: string
  branch: string
  skillBonuses?: Record<
    string,
    {
      skill: string
      value: number
    }
  >
  statBonuses?: Record<
    string,
    {
      stat: string
      value: number
    }
  >
  charParamBonuses?: Record<
    string,
    {
      charParam: string
      value: number
    }
  >
  effects?: Record<
    string,
    {
      title: string
      titleFr?: string
      summary: string
      summaryFr?: string
      type: string
      formula?: string
    }
  >
  actions?: Record<
    string,
    {
      title: string
      titleFr?: string
      summary: string
      summaryFr?: string
      type: string
      skill: string
      duration: string
      time?: string
      timeFr?: string
      damages?: string
      offsetSkill?: string
      uses?: number
      isKarmic?: boolean
      karmicCost?: number
    }
  >
}

const generalRange = [...Array(2)].map((_, i) => ({
  value: i + 1,
  label: String(i + 1)
}));

const branchRange = [...Array(8)].map((_, i) => ({
  value: i + 3,
  label: String(i + 3)
}));

const AdminNewNode: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { search } = useLocation();
  const navigate = useNavigate();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const {
    skills,
    stats,
    charParams,
    actionTypes,
    actionDurations,
    reloadCyberFrames,
    reloadSkills
  } = useGlobalVars();

  const params = useMemo(() => new URLSearchParams(search), [search]);

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
        label: skill.title
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
        label: stat.title
      })),
    [stats]
  );
  const [statBonusIds, setStatBonusIds] = useState<number[]>([]);

  const charParamSelect = useMemo(
    () =>
      charParams.map(({ charParam }) => ({
        value: charParam._id,
        // TODO : Handle Internationalization
        label: charParam.title
      })),
    [charParams]
  );
  const [charParamBonusIds, setCharParamBonusIds] = useState<number[]>([]);

  const [branches, setBranches] = useState<
  ICuratedSkillBranch[] | ICuratedCyberFrameBranch[]
  >([]);

  const [rankSelect, setLevelSelect] = useState<
    Array<{
      value: number
      label: string
    }>
  >([]);

  const actionTypeSelect = useMemo(
    () =>
      actionTypes.map(({
        name, _id
      }) => ({
        value: _id,
        label: t(`terms.actionType.${name}`)
      })),
    [actionTypes, t]
  );

  const actionDurationSelect = useMemo(
    () =>
      actionDurations.map(({
        name, _id
      }) => ({
        value: _id,
        label: t(`terms.actionDuration.${name}`)
      })),
    [actionDurations, t]
  );

  const [effectIds, setEffectIds] = useState<number[]>([]);

  const [actionIds, setActionIds] = useState<number[]>([]);

  const [, setLoading] = useState(true);
  const calledApi = useRef(false);

  const introEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const introFrEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const {
    handleSubmit,
    setError,
    setValue,
    unregister,
    control,
    formState: { errors }
  } = useForm<FormValues>({ defaultValues: { icon: 'default' } });

  const boolRange = useMemo(
    () => [
      {
        value: '1',
        label: t('terms.general.yes')
      },
      {
        value: '0',
        label: t('terms.general.no')
      }
    ],
    [t]
  );

  const branchSelect = useMemo(() => branches.reduce(
    (
      result: Array<{
        value: string
        label: string
      }>,
      elt: ICuratedSkillBranch | ICuratedCyberFrameBranch
    ) => {
      const relevantElt
      = (
        elt as ICuratedCyberFrameBranch | undefined
      )?.cyberFrameBranch !== undefined
        ? (elt as ICuratedCyberFrameBranch).cyberFrameBranch
        : (elt as ICuratedSkillBranch).skillBranch;

      result.push({
        value: relevantElt._id,
        // TODO : Handle Internationalization
        label:
                  relevantElt.title === '_general' ? t('terms.node.generalBranch') : relevantElt.title
      });

      return result;
    },
    []
  ), [branches, t]);

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

  const getData = useCallback(() => {
    if (api !== undefined) {
      const skillId = params.get('skillId');
      const cyberFrameId = params.get('cyberFrameId');
      if (cyberFrameId !== null) {
        api.cyberFrames
          .get({ cyberFrameId })
          .then((sentCyberFrame) => {
            setCyberFrame(sentCyberFrame);
            setBranches(sentCyberFrame.cyberFrame.branches);
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
              )
            });
          });
      } else if (skillId !== null) {
        api.skills
          .get({ skillId })
          .then((curatedSkill) => {
            setSkill(curatedSkill);
            setBranches(curatedSkill.skill.branches);
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
    }
  }, [
    api,
    createAlert,
    getNewId,
    params,
    t
  ]);

  const onSaveNode: SubmitHandler<FormValues> = useCallback(
    ({
      name,
      nameFr,
      quote,
      quoteFr,
      rank,
      icon,
      branch,
      effects,
      actions,
      ...elts
    }) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }

      // Check duplicate on skills
      const skillBonuses
      = elts.skillBonuses !== undefined
        ? Object.values(elts.skillBonuses)
        : [];
      let duplicateSkillBonuses = false;
      if (skillBonuses.length > 0) {
        duplicateSkillBonuses = isThereDuplicate(
          skillBonuses.map(skillBonus => skillBonus.skill)
        );
      }
      if (duplicateSkillBonuses) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminNewNode.errorDuplicateSkill', { ns: 'pages' })
        });

        return;
      }

      // Check duplicate on stats
      const statBonuses
      = elts.statBonuses !== undefined
        ? Object.values(elts.statBonuses)
        : [];
      let duplicateStatBonuses = false;
      if (statBonuses.length > 0) {
        duplicateStatBonuses = isThereDuplicate(
          statBonuses.map(statBonus => statBonus.stat)
        );
      }
      if (duplicateStatBonuses) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminNewNode.errorDuplicateStat', { ns: 'pages' })
        });

        return;
      }

      // Check duplicate on character param
      const charParamBonuses
        = elts.charParamBonuses !== undefined
          ? Object.values(elts.charParamBonuses)
          : [];
      let duplicateCharParamBonuses = false;
      if (charParamBonuses.length > 0) {
        duplicateCharParamBonuses = isThereDuplicate(
          charParamBonuses.map(charParamBonus => charParamBonus.charParam)
        );
      }
      if (duplicateCharParamBonuses) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminNewNode.errorDuplicateCharParam', { ns: 'pages' })
        });

        return;
      }

      const skillId = params.get('skillId');
      const curatedSkillBonuses = skillBonuses.map(({
        skill, value
      }) => ({
        skill,
        value: Number(value)
      }));
      const curatedStatBonuses = statBonuses.map(({
        stat, value
      }) => ({
        stat,
        value: Number(value)
      }));
      const curatedCharParamBonuses = charParamBonuses.map(({
        charParam, value
      }) => ({
        charParam,
        value: Number(value)
      }));

      const effectsArr = effects !== undefined ? Object.values(effects) : [];
      const curatedEffects = effectsArr.map(
        ({
          formula, type, title, summary, titleFr, summaryFr
        }) => ({
          title,
          summary,
          formula,
          type,
          i18n: { ...(titleFr !== undefined || summaryFr !== undefined
            ? { fr: {
                title: titleFr,
                summary: summaryFr
              } }
            : {}) }
        })
      );

      const actionsArr = actions !== undefined ? Object.values(actions) : [];

      const curatedActions = actionsArr.map(
        ({
          type,
          title,
          summary,
          titleFr,
          skill,
          duration,
          time,
          timeFr,
          damages,
          offsetSkill,
          uses,
          isKarmic,
          karmicCost,
          summaryFr
        }) => ({
          title,
          summary,
          type,
          skill,
          duration,
          time,
          damages,
          offsetSkill,
          uses,
          isKarmic: String(isKarmic) === '1',
          karmicCost,
          i18n: { ...(
            titleFr !== undefined
            || summaryFr !== undefined
            || timeFr !== undefined
              ? { fr: {
                  title: titleFr,
                  summary: summaryFr,
                  time: timeFr
                } }
              : {}) }
        })
      );

      let html: string | null = introEditor.getHTML();
      const htmlFr = introFrEditor.getHTML();
      if (html === '<p class="ap"></p>') {
        html = null;
      }

      let i18n: InternationalizationType | null = null;

      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>' || quoteFr !== '') {
        i18n = { fr: {
          title: nameFr,
          summary: htmlFr,
          quote: quoteFr
        } };
      }

      api.nodes
        .create({
          title: name,
          ...(
            skillId !== null
              ? { skillBranch: branch }
              : { cyberFrameBranch: branch }
          ),
          summary: html,
          rank: Number(rank),
          icon,
          quote,
          i18n,
          skillBonuses: curatedSkillBonuses,
          statBonuses: curatedStatBonuses,
          charParamBonuses: curatedCharParamBonuses,
          effects: curatedEffects,
          actions: curatedActions
        })
        .then((quote) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewNode.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          if (skillId !== null) {
            reloadSkills();
          } else {
            reloadCyberFrames();
          }
          void navigate(`/admin/node/${quote._id}`);
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.quoteType.${data.sent}`), 'capitalize') })
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.quoteType.${data.sent}`), 'capitalize') })
            });
          }
        });
    },
    [
      introEditor,
      introFrEditor,
      api,
      params,
      setError,
      t,
      getNewId,
      createAlert,
      navigate,
      reloadSkills,
      reloadCyberFrames
    ]
  );

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
      getData();
    }
  }, [
    api,
    createAlert,
    getNewId,
    getData,
    t
  ]);

  useEffect(() => {
    if (rankSelect.length > 0) {
      setValue('rank', rankSelect[0].value);
    }
  }, [rankSelect, setValue]);

  return (
    <div
      className={classTrim(`
        adminNewNode
        ${displayInt ? 'adminNewNode--int-visible' : ''}
      `)}
    >
      <form
        className="adminNewNode__content"
        onSubmit={(evt) => {
          void handleSubmit(onSaveNode)(evt);
        }}
        noValidate
      >
        <Atitle className="adminNewNode__head" level={1}>
          {t('adminNewNode.title', { ns: 'pages' })}
        </Atitle>
        <div className="adminNewNode__ariane">
          <Ap className="adminEditNode__ariane__elt">
            {skill !== null
              ? (
                  <>
                    {`${t(`terms.skill.name`)}:`}
                    <Aa
                      href={`/admin/skill/${skill.skill._id}`}
                    >
                      {skill.skill.title}
                    </Aa>
                  </>
                )
              : (
                  <>
                    {`${t(`terms.cyberFrame.name`)}:`}
                    <Aa
                      href={`/admin/cyberframe/${cyberFrame?.cyberFrame._id}`}
                    >
                      {cyberFrame?.cyberFrame.title}
                    </Aa>
                  </>
                )}
          </Ap>
        </div>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminNewNode__visual">
          <NodeIconSelect
            label={t('iconNode.label', { ns: 'fields' })}
            control={control}
            inputName="icon"
            rules={{ required: t('iconNode.required', { ns: 'fields' }) }}
          />
        </div>
        <div className="adminNewNode__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameNode.required', { ns: 'fields' }) }}
            label={t('nameNode.label', { ns: 'fields' })}
            className="adminNewNode__basics__name"
          />
          <SmartSelect
            control={control}
            inputName="branch"
            rules={{ required: t('branchNode.required', { ns: 'fields' }) }}
            label={t('branchNode.label', { ns: 'fields' })}
            options={branchSelect}
            onChange={(e) => {
              let titleBranch: string | null = null;
              branches.forEach(
                (elt: ICuratedSkillBranch | ICuratedCyberFrameBranch) => {
                  const relevantElt
                  = (
                    elt as ICuratedCyberFrameBranch | undefined
                  )?.cyberFrameBranch
                  ?? (elt as ICuratedSkillBranch).skillBranch;
                  if (relevantElt._id === e.value) {
                    titleBranch = relevantElt.title;
                  }
                });
              if ((titleBranch as string | null) === '_general') {
                setLevelSelect(generalRange);
              } else {
                setLevelSelect(branchRange);
              }
            }}
            className="adminNewNode__basics__type"
          />
          <SmartSelect
            control={control}
            placeholder="0"
            inputName="rank"
            rules={{ required: t('rankNode.required', { ns: 'fields' }) }}
            label={t('rankNode.label', { ns: 'fields' })}
            options={rankSelect}
            className="adminNewNode__basics__rank"
            disabled={rankSelect.length === 0}
          />
        </div>
        <div className="adminNewNode__details">
          <RichTextElement
            label={t('nodeSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
          <Input
            control={control}
            inputName="quote"
            type="text"
            label={t('quoteNode.label', { ns: 'fields' })}
            className="adminNewNode__details__quote"
          />
        </div>
        <Atitle className="adminNewNode__bonus-title" level={2}>
          {t('adminNewNode.values', { ns: 'pages' })}
        </Atitle>
        <div className="adminNewNode__bonuses">
          <div className="adminNewNode__bonuses__elts">
            {skillBonusIds.map(skillBonusId => (
              <div className="adminNewNode__bonus" key={`skill-${skillBonusId}`}>
                <Atitle className="adminNewNode__bonus__title" level={4}>
                  {t('adminNewNode.skillBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewNode__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.skill`}
                    rules={{ required: t('skillBonusSkill.required', { ns: 'fields' }) }}
                    label={t('skillBonusSkill.label', { ns: 'fields' })}
                    options={skillSelect}
                    className="adminNewNode__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.value`}
                    type="number"
                    rules={{ required: t('skillBonusValue.required', { ns: 'fields' }) }}
                    label={t('skillBonusValue.label', { ns: 'fields' })}
                    className="adminNewNode__bonus__value"
                  />
                </div>
                <Button
                  icon="Delete"
                  theme="afterglow"
                  onClick={() => {
                    setSkillBonusIds(prev =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== skillBonusId) {
                          result.push(elt);
                        }

                        return result;
                      }, [])
                    );
                    unregister(`skillBonuses.skill-${skillBonusId}`);
                  }}
                  className="adminNewNode__bonus__button"
                />
              </div>
            ))}
            {statBonusIds.map(statBonusId => (
              <div className="adminNewNode__bonus" key={`stat-${statBonusId}`}>
                <Atitle className="adminNewNode__bonus__title" level={4}>
                  {t('adminNewNode.statBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewNode__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.stat`}
                    rules={{ required: t('statBonusStat.required', { ns: 'fields' }) }}
                    label={t('statBonusStat.label', { ns: 'fields' })}
                    options={statSelect}
                    className="adminNewNode__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.value`}
                    type="number"
                    rules={{ required: t('statBonusValue.required', { ns: 'fields' }) }}
                    label={t('statBonusValue.label', { ns: 'fields' })}
                    className="adminNewNode__bonus__value"
                  />
                </div>
                <Button
                  icon="Delete"
                  theme="afterglow"
                  onClick={() => {
                    setStatBonusIds(prev =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== statBonusId) {
                          result.push(elt);
                        }

                        return result;
                      }, [])
                    );
                    unregister(`statBonuses.stat-${statBonusId}`);
                  }}
                  className="adminNewNode__bonus__button"
                />
              </div>
            ))}
            {charParamBonusIds.map(charParamBonusId => (
              <div className="adminNewNode__bonus" key={`charParam-${charParamBonusId}`}>
                <Atitle className="adminNewNode__bonus__title" level={4}>
                  {t('adminNewNode.charParamBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewNode__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={
                      `charParamBonuses.charParam-${charParamBonusId}.charParam`
                    }
                    rules={{ required: t('charParamBonusStat.required', { ns: 'fields' }) }}
                    label={t('charParamBonusStat.label', { ns: 'fields' })}
                    options={charParamSelect}
                    className="adminNewNode__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={
                      `charParamBonuses.charParam-${charParamBonusId}.value`
                    }
                    type="number"
                    rules={{ required: t('charParamBonusValue.required', { ns: 'fields' }) }}
                    label={t('charParamBonusValue.label', { ns: 'fields' })}
                    className="adminNewNode__bonus__value"
                  />
                </div>
                <Button
                  icon="Delete"
                  theme="afterglow"
                  onClick={() => {
                    setCharParamBonusIds(prev =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== charParamBonusId) {
                          result.push(elt);
                        }

                        return result;
                      }, [])
                    );
                    unregister(
                      `charParamBonuses.charParam-${charParamBonusId}`
                    );
                  }}
                  className="adminNewNode__bonus__button"
                />
              </div>
            ))}
            {effectIds.map(effectId => (
              <div className="adminNewNode__bonus" key={`charParam-${effectId}`}>
                <Atitle className="adminNewNode__bonus__title" level={4}>
                  {t('adminNewNode.effectTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewNode__bonus__fields adminNewNode__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.title`}
                    rules={{ required: t('effectTitle.required', { ns: 'fields' }) }}
                    label={t('effectTitle.label', { ns: 'fields' })}
                    className="adminNewNode__bonus__value adminNewNode__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`effects.effect-${effectId}.type`}
                    rules={{ required: t('effectType.required', { ns: 'fields' }) }}
                    label={t('effectType.label', { ns: 'fields' })}
                    options={actionTypeSelect}
                    className="adminNewNode__bonus__select adminNewNode__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`effects.effect-${effectId}.summary`}
                    rules={{ required: t('effectSummary.required', { ns: 'fields' }) }}
                    label={t('effectSummary.label', { ns: 'fields' })}
                    className="adminNewNode__bonus__value adminNewNode__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.formula`}
                    label={t('effectFormula.label', { ns: 'fields' })}
                    className="adminNewNode__bonus__value adminNewNode__bonus__value--l"
                  />
                  <Atitle className="adminNewNode__bonus__title" level={4}>
                    {t('adminNewNode.effectInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.titleFr`}
                    label={`${t('effectTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminNewNode__bonus__value adminNewNode__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`effects.effect-${effectId}.summaryFr`}
                    label={`${t('effectSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminNewNode__bonus__value adminNewNode__bonus__value--l"
                  />
                </div>
                <Button
                  icon="Delete"
                  theme="afterglow"
                  onClick={() => {
                    setEffectIds(prev =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== effectId) {
                          result.push(elt);
                        }

                        return result;
                      }, [])
                    );
                    unregister(`effects.effect-${effectId}`);
                  }}
                  className="adminNewNode__bonus__button"
                />
              </div>
            ))}
            {actionIds.map(actionId => (
              <div className="adminNewNode__bonus" key={`charParam-${actionId}`}>
                <Atitle className="adminNewNode__bonus__title" level={4}>
                  {t('adminNewNode.actionTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewNode__bonus__fields adminNewNode__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.title`}
                    rules={{ required: t('actionTitle.required', { ns: 'fields' }) }}
                    label={t('actionTitle.label', { ns: 'fields' })}
                    className="adminNewNode__bonus__value adminNewNode__bonus__value--l"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.type`}
                    rules={{ required: t('actionType.required', { ns: 'fields' }) }}
                    label={t('actionType.label', { ns: 'fields' })}
                    options={actionTypeSelect}
                    className="adminNewNode__bonus__select adminNewNode__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.duration`}
                    rules={{ required: t('actionDuration.required', { ns: 'fields' }) }}
                    label={t('actionDuration.label', { ns: 'fields' })}
                    options={actionDurationSelect}
                    className="adminNewNode__bonus__select adminNewNode__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`actions.action-${actionId}.summary`}
                    rules={{ required: t('actionSummary.required', { ns: 'fields' }) }}
                    label={t('actionSummary.label', { ns: 'fields' })}
                    className="adminNewNode__bonus__value adminNewNode__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.time`}
                    label={t('actionTime.label', { ns: 'fields' })}
                    className="adminNewNode__bonus__value adminNewNode__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.damages`}
                    label={t('actionDamages.label', { ns: 'fields' })}
                    className="adminNewNode__bonus__value adminNewNode__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.skill`}
                    label={t('actionSkill.label', { ns: 'fields' })}
                    options={[
                      {
                        value: '',
                        label: ''
                      },
                      ...skillSelect
                    ]}
                    className="adminNewNode__bonus__select adminNewNode__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.offsetSkill`}
                    label={t('actionOffsetSkill.label', { ns: 'fields' })}
                    className="adminNewNode__bonus__value adminNewNode__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.isKarmic`}
                    label={t('actionIsKarmic.label', { ns: 'fields' })}
                    options={boolRange}
                    className="adminNewNode__bonus__select adminNewNode__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="number"
                    inputName={`actions.action-${actionId}.karmicCost`}
                    label={t('actionKarmicCost.label', { ns: 'fields' })}
                    className="adminNewNode__bonus__value adminNewNode__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="number"
                    inputName={`actions.action-${actionId}.uses`}
                    label={t('actionUses.label', { ns: 'fields' })}
                    className="adminNewNode__bonus__value adminNewNode__bonus__value--l"
                  />
                  <Atitle className="adminNewNode__bonus__title" level={4}>
                    {t('adminNewNode.actionInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.titleFr`}
                    label={`${t('actionTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminNewNode__bonus__value adminNewNode__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`actions.action-${actionId}.summaryFr`}
                    label={`${t('actionSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminNewNode__bonus__value adminNewNode__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.timeFr`}
                    label={`${t('actionTime.label', { ns: 'fields' })} (FR)`}
                    className="adminNewNode__bonus__value adminNewNode__bonus__value--l"
                  />
                </div>
                <Button
                  icon="Delete"
                  theme="afterglow"
                  onClick={() => {
                    setActionIds(prev =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== actionId) {
                          result.push(elt);
                        }

                        return result;
                      }, [])
                    );
                    unregister(`actions.action-${actionId}`);
                  }}
                  className="adminNewNode__bonus__button"
                />
              </div>
            ))}
          </div>
          <div className="adminNewNode__bonuses__buttons">
            <Button onClick={onAddSkillBonus}>
              {t('adminNewNode.createSkillBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddStatBonus}>
              {t('adminNewNode.createStatBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddCharParamBonus}>
              {t('adminNewNode.createCharParamBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddAction}>
              {t('adminNewNode.createActionButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddEffect}>
              {t('adminNewNode.createEffectButton', { ns: 'pages' })}
            </Button>
          </div>
        </div>
        <div className="adminNewNode__intl-title">
          <div className="adminNewNode__intl-title__content">
            <Atitle className="adminNewNode__intl-title__title" level={2}>
              {t('adminNewNode.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminNewNode__intl-title__info">
              {t('adminNewNode.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt(prev => !prev);
            }}
            className="adminNewNode__intl-title__btn"
          />
        </div>
        <div className="adminNewNode__intl">
          <div className="adminNewNode__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameNode.label', { ns: 'fields' })} (FR)`}
              className="adminNewNode__basics__name"
            />
          </div>
          <div className="adminNewNode__details">
            <RichTextElement
              label={`${t('nodeSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent=""
              small
              complete
            />
            <Input
              control={control}
              inputName="quoteFr"
              type="text"
              label={`${t('quoteNode.label', { ns: 'fields' })} (FR)`}
              className="adminNewNode__details__quote"
            />
          </div>
        </div>
        <Button type="submit">{t('adminNewNode.createButton', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewNode;
