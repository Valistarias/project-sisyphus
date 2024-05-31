import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input, SmartSelect } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';
import { type ICuratedArmor } from '../../../types';
import { possibleStarterKitValues } from '../../../types/items';

import { classTrim, isThereDuplicate } from '../../../utils';

import './adminEditArmor.scss';

interface FormValues {
  name: string;
  nameFr: string;
  cost: number;
  rarity: string;
  starterKit: string;
  armorType: string;
  itemModifiers: string[];
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

const AdminEditArmor: FC = () => {
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
    armorTypes,
    rarities,
    itemModifiers,
  } = useGlobalVars();
  const { createAlert, getNewId } = useSystemAlerts();
  const navigate = useNavigate();

  const [displayInt, setDisplayInt] = useState(false);

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

  const armorTypeSelect = useMemo(
    () =>
      armorTypes.map(({ armorType }) => ({
        value: armorType._id,
        label: armorType.title,
      })),
    [armorTypes]
  );

  const rarityList = useMemo(() => {
    return rarities.map(({ rarity }) => ({
      value: rarity._id,
      label: rarity.title,
    }));
  }, [rarities]);

  const itemModifierList = useMemo(() => {
    return itemModifiers.map(({ itemModifier }) => ({
      value: itemModifier._id,
      label: itemModifier.title,
    }));
  }, [itemModifiers]);

  const starterKitList = useMemo(
    () =>
      possibleStarterKitValues.map((possibleStarterKitValue) => ({
        value: possibleStarterKitValue,
        label: t(`terms.starterKit.${possibleStarterKitValue}`),
      })),
    [t]
  );

  const [effectIds, setEffectIds] = useState<number[]>([]);
  const [actionIds, setActionIds] = useState<number[]>([]);

  const calledApi = useRef(false);

  const [armorData, setArmorData] = useState<ICuratedArmor | null>(null);

  const [armorText, setArmorText] = useState('');
  const [armorTextFr, setArmorTextFr] = useState('');

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const createDefaultData = useCallback((armorData: ICuratedArmor | null) => {
    if (armorData == null) {
      return {};
    }
    const { armor, i18n } = armorData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = armor.title;
    defaultData.cost = armor.cost;
    defaultData.rarity = armor.rarity;
    defaultData.armorType = armor.armorType;
    defaultData.itemModifiers = armor.itemModifiers;
    defaultData.starterKit = armor.starterKit ?? 'never';
    if (i18n.fr !== undefined) {
      defaultData.nameFr = i18n.fr.title ?? '';
    }

    // Init Bonus Skill
    const tempSkillBonusId: number[] = [];
    armor.skillBonuses?.forEach((skillBonus) => {
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
    armor.statBonuses?.forEach((statBonus) => {
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
    armor.charParamBonuses?.forEach((charParamBonus) => {
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
    armor.actions?.forEach((action) => {
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
    armor.effects?.forEach((effect) => {
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
    unregister,
    control,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: useMemo(() => createDefaultData(armorData), [createDefaultData, armorData]),
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

  const onSaveArmor: SubmitHandler<FormValues> = useCallback(
    ({
      name,
      nameFr,
      cost,
      rarity,
      itemModifiers,
      armorType,
      effects,
      actions,
      starterKit,
      ...elts
    }) => {
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
          message: t('adminEditArmor.errorDuplicateSkill', { ns: 'pages' }),
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
          message: t('adminEditArmor.errorDuplicateStat', { ns: 'pages' }),
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
          message: t('adminEditArmor.errorDuplicateCharParam', { ns: 'pages' }),
        });
        return;
      }
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
      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        i18n = {
          fr: {
            title: nameFr,
            summary: htmlFr,
          },
        };
      }
      api.armors
        .update({
          id,
          title: name,
          cost: Number(cost),
          rarity,
          starterKit,
          armorType,
          itemType: armorData?.armor.itemType,
          itemModifiers,
          summary: html,
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
                <Ap>{t('adminEditArmor.successUpdate', { ns: 'pages' })}</Ap>
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
    [introEditor, introFrEditor, api, id, armorData, setError, t, getNewId, createAlert]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || armorData === null) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditArmor.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditArmor.confirmDeletion.text', {
          ns: 'pages',
          elt: armorData?.armor.title,
        }),
        confirmCta: t('adminEditArmor.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.armors
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditArmor.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                navigate('/admin/armors');
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
    armorData,
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
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.armors
        .get({ armorId: id })
        .then((curatedArmor: ICuratedArmor) => {
          const { armor, i18n } = curatedArmor;
          setArmorData(curatedArmor);
          setArmorText(armor.summary);
          if (i18n.fr !== undefined) {
            setArmorTextFr(i18n.fr.summary ?? '');
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

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(armorData));
  }, [armorData, reset, createDefaultData]);

  return (
    <div
      className={classTrim(`
        adminEditArmor
        ${displayInt ? 'adminEditArmor--int-visible' : ''}
      `)}
    >
      <form className="adminEditArmor__content" onSubmit={handleSubmit(onSaveArmor)} noValidate>
        <div className="adminEditArmor__head">
          <Atitle className="adminEditArmor__head" rank={1}>
            {t('adminEditArmor.title', { ns: 'pages' })}
          </Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditArmor.delete', { ns: 'pages' })}
          </Button>
        </div>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditArmor__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameArmor.required', { ns: 'fields' }),
            }}
            label={t('nameArmor.label', { ns: 'fields' })}
            className="adminEditArmor__basics__name"
          />
          <div className="adminEditArmor__basics__class">
            <SmartSelect
              control={control}
              inputName="armorType"
              rules={{
                required: t('armorType.required', { ns: 'fields' }),
              }}
              label={t('armorType.label', { ns: 'fields' })}
              options={armorTypeSelect}
              className="adminEditArmor__basics__type"
            />
          </div>
        </div>
        <div className="adminEditArmor__details">
          <RichTextElement
            label={t('armorSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={armorText}
            small
            complete
          />
          <div className="adminEditArmor__details__fields">
            <Input
              control={control}
              inputName="cost"
              type="number"
              rules={{
                required: t('armorCost.required', { ns: 'fields' }),
              }}
              label={t('armorCost.label', { ns: 'fields' })}
              className="adminEditArmor__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="rarity"
              label={t('armorRarity.label', { ns: 'fields' })}
              rules={{ required: t('armorRarity.required', { ns: 'fields' }) }}
              options={rarityList}
              className="adminEditArmor__details__fields__elt"
            />
            <SmartSelect
              control={control}
              isMulti
              inputName="itemModifiers"
              label={t('itemModifiers.label', { ns: 'fields' })}
              options={itemModifierList}
              className="adminEditArmor__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="starterKit"
              label={t('armorStarterKit.label', { ns: 'fields' })}
              options={starterKitList}
              className="adminEditArmor__details__fields__elt"
            />
          </div>
        </div>
        <Atitle className="adminEditArmor__bonus-title" level={2}>
          {t('adminEditArmor.values', { ns: 'pages' })}
        </Atitle>
        <div className="adminEditArmor__bonuses">
          <div className="adminEditArmor__bonuses__elts">
            {skillBonusIds.map((skillBonusId) => (
              <div className="adminEditArmor__bonus" key={`skill-${skillBonusId}`}>
                <Atitle className="adminEditArmor__bonus__title" level={4}>
                  {t('adminEditArmor.skillBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditArmor__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.skill`}
                    rules={{
                      required: t('skillBonusSkill.required', { ns: 'fields' }),
                    }}
                    label={t('skillBonusSkill.label', { ns: 'fields' })}
                    options={skillSelect}
                    className="adminEditArmor__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.value`}
                    type="number"
                    rules={{
                      required: t('skillBonusValue.required', { ns: 'fields' }),
                    }}
                    label={t('skillBonusValue.label', { ns: 'fields' })}
                    className="adminEditArmor__bonus__value"
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
                  className="adminEditArmor__bonus__button"
                />
              </div>
            ))}
            {statBonusIds.map((statBonusId) => (
              <div className="adminEditArmor__bonus" key={`stat-${statBonusId}`}>
                <Atitle className="adminEditArmor__bonus__title" level={4}>
                  {t('adminEditArmor.statBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditArmor__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.stat`}
                    rules={{
                      required: t('statBonusStat.required', { ns: 'fields' }),
                    }}
                    label={t('statBonusStat.label', { ns: 'fields' })}
                    options={statSelect}
                    className="adminEditArmor__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.value`}
                    type="number"
                    rules={{
                      required: t('statBonusValue.required', { ns: 'fields' }),
                    }}
                    label={t('statBonusValue.label', { ns: 'fields' })}
                    className="adminEditArmor__bonus__value"
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
                  className="adminEditArmor__bonus__button"
                />
              </div>
            ))}
            {charParamBonusIds.map((charParamBonusId) => (
              <div className="adminEditArmor__bonus" key={`charParam-${charParamBonusId}`}>
                <Atitle className="adminEditArmor__bonus__title" level={4}>
                  {t('adminEditArmor.charParamBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditArmor__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`charParamBonuses.charParam-${charParamBonusId}.charParam`}
                    rules={{
                      required: t('charParamBonusStat.required', { ns: 'fields' }),
                    }}
                    label={t('charParamBonusStat.label', { ns: 'fields' })}
                    options={charParamSelect}
                    className="adminEditArmor__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`charParamBonuses.charParam-${charParamBonusId}.value`}
                    type="number"
                    rules={{
                      required: t('charParamBonusValue.required', { ns: 'fields' }),
                    }}
                    label={t('charParamBonusValue.label', { ns: 'fields' })}
                    className="adminEditArmor__bonus__value"
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
                  className="adminEditArmor__bonus__button"
                />
              </div>
            ))}
            {effectIds.map((effectId) => (
              <div className="adminEditArmor__bonus" key={`charParam-${effectId}`}>
                <Atitle className="adminEditArmor__bonus__title" level={4}>
                  {t('adminEditArmor.effectTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditArmor__bonus__fields adminEditArmor__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.title`}
                    rules={{
                      required: t('effectTitle.required', { ns: 'fields' }),
                    }}
                    label={t('effectTitle.label', { ns: 'fields' })}
                    className="adminEditArmor__bonus__value adminEditArmor__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`effects.effect-${effectId}.type`}
                    rules={{
                      required: t('effectType.required', { ns: 'fields' }),
                    }}
                    label={t('effectType.label', { ns: 'fields' })}
                    options={actionTypeSelect}
                    className="adminEditArmor__bonus__select adminEditArmor__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`effects.effect-${effectId}.summary`}
                    rules={{
                      required: t('effectSummary.required', { ns: 'fields' }),
                    }}
                    label={t('effectSummary.label', { ns: 'fields' })}
                    className="adminEditArmor__bonus__value adminEditArmor__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.formula`}
                    label={t('effectFormula.label', { ns: 'fields' })}
                    className="adminEditArmor__bonus__value adminEditArmor__bonus__value--l"
                  />
                  <Atitle className="adminEditArmor__bonus__title" level={4}>
                    {t('adminEditArmor.effectInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.titleFr`}
                    label={`${t('effectTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminEditArmor__bonus__value adminEditArmor__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`effects.effect-${effectId}.summaryFr`}
                    label={`${t('effectSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminEditArmor__bonus__value adminEditArmor__bonus__value--l"
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
                  className="adminEditArmor__bonus__button"
                />
              </div>
            ))}
            {actionIds.map((actionId) => (
              <div className="adminEditArmor__bonus" key={`charParam-${actionId}`}>
                <Atitle className="adminEditArmor__bonus__title" level={4}>
                  {t('adminEditArmor.actionTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditArmor__bonus__fields adminEditArmor__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.title`}
                    rules={{
                      required: t('actionTitle.required', { ns: 'fields' }),
                    }}
                    label={t('actionTitle.label', { ns: 'fields' })}
                    className="adminEditArmor__bonus__value adminEditArmor__bonus__value--l"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.type`}
                    rules={{
                      required: t('actionType.required', { ns: 'fields' }),
                    }}
                    label={t('actionType.label', { ns: 'fields' })}
                    options={actionTypeSelect}
                    className="adminEditArmor__bonus__select adminEditArmor__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.duration`}
                    rules={{
                      required: t('actionDuration.required', { ns: 'fields' }),
                    }}
                    label={t('actionDuration.label', { ns: 'fields' })}
                    options={actionDurationSelect}
                    className="adminEditArmor__bonus__select adminEditArmor__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`actions.action-${actionId}.summary`}
                    rules={{
                      required: t('actionSummary.required', { ns: 'fields' }),
                    }}
                    label={t('actionSummary.label', { ns: 'fields' })}
                    className="adminEditArmor__bonus__value adminEditArmor__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.time`}
                    label={t('actionTime.label', { ns: 'fields' })}
                    className="adminEditArmor__bonus__value adminEditArmor__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.damages`}
                    label={t('actionDamages.label', { ns: 'fields' })}
                    className="adminEditArmor__bonus__value adminEditArmor__bonus__value--s"
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
                    className="adminEditArmor__bonus__select adminEditArmor__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.offsetSkill`}
                    label={t('actionOffsetSkill.label', { ns: 'fields' })}
                    className="adminEditArmor__bonus__value adminEditArmor__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.isKarmic`}
                    label={t('actionIsKarmic.label', { ns: 'fields' })}
                    options={boolRange}
                    className="adminEditArmor__bonus__select adminEditArmor__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="number"
                    inputName={`actions.action-${actionId}.karmicCost`}
                    label={t('actionKarmicCost.label', { ns: 'fields' })}
                    className="adminEditArmor__bonus__value adminEditArmor__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="number"
                    inputName={`actions.action-${actionId}.uses`}
                    label={t('actionUses.label', { ns: 'fields' })}
                    className="adminEditArmor__bonus__value adminEditArmor__bonus__value--l"
                  />
                  <Atitle className="adminEditArmor__bonus__title" level={4}>
                    {t('adminEditArmor.actionInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.titleFr`}
                    label={`${t('actionTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminEditArmor__bonus__value adminEditArmor__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`actions.action-${actionId}.summaryFr`}
                    label={`${t('actionSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminEditArmor__bonus__value adminEditArmor__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.timeFr`}
                    label={`${t('actionTime.label', { ns: 'fields' })} (FR)`}
                    className="adminEditArmor__bonus__value adminEditArmor__bonus__value--l"
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
                  className="adminEditArmor__bonus__button"
                />
              </div>
            ))}
          </div>
          <div className="adminEditArmor__bonuses__buttons">
            <Button onClick={onAddSkillBonus}>
              {t('adminEditArmor.createSkillBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddStatBonus}>
              {t('adminEditArmor.createStatBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddCharParamBonus}>
              {t('adminEditArmor.createCharParamBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddAction}>
              {t('adminEditArmor.createActionButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddEffect}>
              {t('adminEditArmor.createEffectButton', { ns: 'pages' })}
            </Button>
          </div>
        </div>
        <div className="adminEditArmor__intl-title">
          <div className="adminEditArmor__intl-title__content">
            <Atitle className="adminEditArmor__intl-title__title" level={2}>
              {t('adminEditArmor.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditArmor__intl-title__info">
              {t('adminEditArmor.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt((prev) => !prev);
            }}
            className="adminEditArmor__intl-title__btn"
          />
        </div>
        <div className="adminEditArmor__intl">
          <div className="adminEditArmor__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameArmor.label', { ns: 'fields' })} (FR)`}
              className="adminEditArmor__basics__name"
            />
          </div>
          <div className="adminEditArmor__details">
            <RichTextElement
              label={`${t('armorSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent={armorTextFr}
              small
              complete
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditArmor.createButton', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditArmor;
