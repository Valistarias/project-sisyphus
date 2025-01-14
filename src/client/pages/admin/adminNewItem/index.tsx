import React, {
  useCallback, useMemo, useRef, useState, type FC
} from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import {
  useForm, type FieldValues, type SubmitHandler
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  useApi, useGlobalVars, useSystemAlerts
} from '../../../providers';

import {
  Aerror, Ap, Atitle
} from '../../../atoms';
import {
  Button, Input, SmartSelect
} from '../../../molecules';
import {
  Alert, RichTextElement, completeRichTextElementExtentions
} from '../../../organisms';
import { possibleStarterKitValues } from '../../../types/items';

import {
  classTrim, isThereDuplicate
} from '../../../utils';

import './adminNewItem.scss';

interface FormValues {
  name: string
  nameFr: string
  cost: number
  rarity: string
  starterKit: string
  itemModifiers: string[]
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

const AdminNewItem: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
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
    rarities,
    itemTypes,
    itemModifiers
  } = useGlobalVars();

  const [displayInt, setDisplayInt] = useState(false);

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

  const rarityList = useMemo(() => rarities.map(({ rarity }) => ({
    value: rarity._id,
    label: rarity.title
  })), [rarities]);

  const itemModifierList = useMemo(() => itemModifiers.map(({ itemModifier }) => ({
    value: itemModifier._id,
    label: itemModifier.title
  })), [itemModifiers]);

  const starterKitList = useMemo(
    () =>
      possibleStarterKitValues.map(possibleStarterKitValue => ({
        value: possibleStarterKitValue,
        label: t(`terms.starterKit.${possibleStarterKitValue}`)
      })),
    [t]
  );

  const [effectIds, setEffectIds] = useState<number[]>([]);

  const [actionIds, setActionIds] = useState<number[]>([]);

  const introEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const introFrEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const {
    handleSubmit,
    setError,
    unregister,
    control,
    formState: { errors }
  } = useForm({ defaultValues: { icon: 'default' } });

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

  const onSaveItem: SubmitHandler<FormValues> = useCallback(
    ({
      name, nameFr, cost, rarity, itemModifiers, effects, actions, starterKit, ...elts
    }) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }

      // Check duplicate on skills
      const skillBonuses = elts.skillBonuses !== undefined ? Object.values(elts.skillBonuses) : [];
      let duplicateSkillBonuses = false;
      if (skillBonuses.length > 0) {
        duplicateSkillBonuses = isThereDuplicate(
          skillBonuses.map(skillBonus => skillBonus.skill)
        );
      }
      if (duplicateSkillBonuses) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminNewItem.errorDuplicateSkill', { ns: 'pages' })
        });

        return;
      }

      // Check duplicate on stats
      const statBonuses = elts.statBonuses !== undefined ? Object.values(elts.statBonuses) : [];
      let duplicateStatBonuses = false;
      if (statBonuses.length > 0) {
        duplicateStatBonuses = isThereDuplicate(statBonuses.map(statBonus => statBonus.stat));
      }
      if (duplicateStatBonuses) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminNewItem.errorDuplicateStat', { ns: 'pages' })
        });

        return;
      }

      // Check duplicate on character param
      const charParamBonuses
        = elts.charParamBonuses !== undefined ? Object.values(elts.charParamBonuses) : [];
      let duplicateCharParamBonuses = false;
      if (charParamBonuses.length > 0) {
        duplicateCharParamBonuses = isThereDuplicate(
          charParamBonuses.map(charParamBonus => charParamBonus.charParam)
        );
      }
      if (duplicateCharParamBonuses) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminNewItem.errorDuplicateCharParam', { ns: 'pages' })
        });

        return;
      }

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
          i18n: { ...(titleFr !== undefined || summaryFr !== undefined || timeFr !== undefined
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

      let i18n: any | null = null;

      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        i18n = { fr: {
          title: nameFr,
          summary: htmlFr
        } };
      }

      api.items
        .create({
          title: name,
          cost: Number(cost),
          rarity,
          starterKit,
          summary: html,
          itemType: itemTypes.find(itemType => itemType.name === 'itm')?._id ?? undefined,
          itemModifiers,
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
                <Ap>{t('adminNewItem.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          void navigate(`/admin/item/${quote._id}`);
        })
        .catch(({ response }) => {
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
      itemTypes,
      setError,
      t,
      getNewId,
      createAlert,
      navigate
    ]
  );

  return (
    <div
      className={classTrim(`
        adminNewItem
        ${displayInt ? 'adminNewItem--int-visible' : ''}
      `)}
    >
      <form className="adminNewItem__content" onSubmit={handleSubmit(onSaveItem)} noValidate>
        <Atitle className="adminNewItem__head" level={1}>
          {t('adminNewItem.title', { ns: 'pages' })}
        </Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminNewItem__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameItem.required', { ns: 'fields' }) }}
            label={t('nameItem.label', { ns: 'fields' })}
            className="adminNewItem__basics__name"
          />
        </div>
        <div className="adminNewItem__details">
          <RichTextElement
            label={t('itemSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
          <div className="adminNewItem__details__fields">
            <Input
              control={control}
              inputName="cost"
              type="number"
              rules={{ required: t('itemCost.required', { ns: 'fields' }) }}
              label={t('itemCost.label', { ns: 'fields' })}
              className="adminNewItem__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="rarity"
              label={t('itemRarity.label', { ns: 'fields' })}
              rules={{ required: t('itemRarity.required', { ns: 'fields' }) }}
              options={rarityList}
              className="adminNewItem__details__fields__elt"
            />
            <SmartSelect
              control={control}
              isMulti
              inputName="itemModifiers"
              label={t('itemModifiers.label', { ns: 'fields' })}
              options={itemModifierList}
              className="adminNewItem__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="starterKit"
              label={t('itemStarterKit.label', { ns: 'fields' })}
              options={starterKitList}
              className="adminNewItem__details__fields__elt"
            />
          </div>
        </div>
        <Atitle className="adminNewItem__bonus-title" level={2}>
          {t('adminNewItem.values', { ns: 'pages' })}
        </Atitle>
        <div className="adminNewItem__bonuses">
          <div className="adminNewItem__bonuses__elts">
            {skillBonusIds.map(skillBonusId => (
              <div className="adminNewItem__bonus" key={`skill-${skillBonusId}`}>
                <Atitle className="adminNewItem__bonus__title" level={4}>
                  {t('adminNewItem.skillBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewItem__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.skill`}
                    rules={{ required: t('skillBonusSkill.required', { ns: 'fields' }) }}
                    label={t('skillBonusSkill.label', { ns: 'fields' })}
                    options={skillSelect}
                    className="adminNewItem__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.value`}
                    type="number"
                    rules={{ required: t('skillBonusValue.required', { ns: 'fields' }) }}
                    label={t('skillBonusValue.label', { ns: 'fields' })}
                    className="adminNewItem__bonus__value"
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
                  className="adminNewItem__bonus__button"
                />
              </div>
            ))}
            {statBonusIds.map(statBonusId => (
              <div className="adminNewItem__bonus" key={`stat-${statBonusId}`}>
                <Atitle className="adminNewItem__bonus__title" level={4}>
                  {t('adminNewItem.statBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewItem__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.stat`}
                    rules={{ required: t('statBonusStat.required', { ns: 'fields' }) }}
                    label={t('statBonusStat.label', { ns: 'fields' })}
                    options={statSelect}
                    className="adminNewItem__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.value`}
                    type="number"
                    rules={{ required: t('statBonusValue.required', { ns: 'fields' }) }}
                    label={t('statBonusValue.label', { ns: 'fields' })}
                    className="adminNewItem__bonus__value"
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
                  className="adminNewItem__bonus__button"
                />
              </div>
            ))}
            {charParamBonusIds.map(charParamBonusId => (
              <div className="adminNewItem__bonus" key={`charParam-${charParamBonusId}`}>
                <Atitle className="adminNewItem__bonus__title" level={4}>
                  {t('adminNewItem.charParamBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewItem__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`charParamBonuses.charParam-${charParamBonusId}.charParam`}
                    rules={{ required: t('charParamBonusStat.required', { ns: 'fields' }) }}
                    label={t('charParamBonusStat.label', { ns: 'fields' })}
                    options={charParamSelect}
                    className="adminNewItem__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`charParamBonuses.charParam-${charParamBonusId}.value`}
                    type="number"
                    rules={{ required: t('charParamBonusValue.required', { ns: 'fields' }) }}
                    label={t('charParamBonusValue.label', { ns: 'fields' })}
                    className="adminNewItem__bonus__value"
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
                    unregister(`charParamBonuses.charParam-${charParamBonusId}`);
                  }}
                  className="adminNewItem__bonus__button"
                />
              </div>
            ))}
            {effectIds.map(effectId => (
              <div className="adminNewItem__bonus" key={`charParam-${effectId}`}>
                <Atitle className="adminNewItem__bonus__title" level={4}>
                  {t('adminNewItem.effectTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewItem__bonus__fields adminNewItem__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.title`}
                    rules={{ required: t('effectTitle.required', { ns: 'fields' }) }}
                    label={t('effectTitle.label', { ns: 'fields' })}
                    className="adminNewItem__bonus__value adminNewItem__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`effects.effect-${effectId}.type`}
                    rules={{ required: t('effectType.required', { ns: 'fields' }) }}
                    label={t('effectType.label', { ns: 'fields' })}
                    options={actionTypeSelect}
                    className="adminNewItem__bonus__select adminNewItem__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`effects.effect-${effectId}.summary`}
                    rules={{ required: t('effectSummary.required', { ns: 'fields' }) }}
                    label={t('effectSummary.label', { ns: 'fields' })}
                    className="adminNewItem__bonus__value adminNewItem__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.formula`}
                    label={t('effectFormula.label', { ns: 'fields' })}
                    className="adminNewItem__bonus__value adminNewItem__bonus__value--l"
                  />
                  <Atitle className="adminNewItem__bonus__title" level={4}>
                    {t('adminNewItem.effectInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.titleFr`}
                    label={`${t('effectTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminNewItem__bonus__value adminNewItem__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`effects.effect-${effectId}.summaryFr`}
                    label={`${t('effectSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminNewItem__bonus__value adminNewItem__bonus__value--l"
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
                  className="adminNewItem__bonus__button"
                />
              </div>
            ))}
            {actionIds.map(actionId => (
              <div className="adminNewItem__bonus" key={`charParam-${actionId}`}>
                <Atitle className="adminNewItem__bonus__title" level={4}>
                  {t('adminNewItem.actionTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewItem__bonus__fields adminNewItem__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.title`}
                    rules={{ required: t('actionTitle.required', { ns: 'fields' }) }}
                    label={t('actionTitle.label', { ns: 'fields' })}
                    className="adminNewItem__bonus__value adminNewItem__bonus__value--l"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.type`}
                    rules={{ required: t('actionType.required', { ns: 'fields' }) }}
                    label={t('actionType.label', { ns: 'fields' })}
                    options={actionTypeSelect}
                    className="adminNewItem__bonus__select adminNewItem__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.duration`}
                    rules={{ required: t('actionDuration.required', { ns: 'fields' }) }}
                    label={t('actionDuration.label', { ns: 'fields' })}
                    options={actionDurationSelect}
                    className="adminNewItem__bonus__select adminNewItem__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`actions.action-${actionId}.summary`}
                    rules={{ required: t('actionSummary.required', { ns: 'fields' }) }}
                    label={t('actionSummary.label', { ns: 'fields' })}
                    className="adminNewItem__bonus__value adminNewItem__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.time`}
                    label={t('actionTime.label', { ns: 'fields' })}
                    className="adminNewItem__bonus__value adminNewItem__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.damages`}
                    label={t('actionDamages.label', { ns: 'fields' })}
                    className="adminNewItem__bonus__value adminNewItem__bonus__value--s"
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
                    className="adminNewItem__bonus__select adminNewItem__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.offsetSkill`}
                    label={t('actionOffsetSkill.label', { ns: 'fields' })}
                    className="adminNewItem__bonus__value adminNewItem__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.isKarmic`}
                    label={t('actionIsKarmic.label', { ns: 'fields' })}
                    options={boolRange}
                    className="adminNewItem__bonus__select adminNewItem__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="number"
                    inputName={`actions.action-${actionId}.karmicCost`}
                    label={t('actionKarmicCost.label', { ns: 'fields' })}
                    className="adminNewItem__bonus__value adminNewItem__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="number"
                    inputName={`actions.action-${actionId}.uses`}
                    label={t('actionUses.label', { ns: 'fields' })}
                    className="adminNewItem__bonus__value adminNewItem__bonus__value--l"
                  />
                  <Atitle className="adminNewItem__bonus__title" level={4}>
                    {t('adminNewItem.actionInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.titleFr`}
                    label={`${t('actionTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminNewItem__bonus__value adminNewItem__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`actions.action-${actionId}.summaryFr`}
                    label={`${t('actionSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminNewItem__bonus__value adminNewItem__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.timeFr`}
                    label={`${t('actionTime.label', { ns: 'fields' })} (FR)`}
                    className="adminNewItem__bonus__value adminNewItem__bonus__value--l"
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
                  className="adminNewItem__bonus__button"
                />
              </div>
            ))}
          </div>
          <div className="adminNewItem__bonuses__buttons">
            <Button onClick={onAddSkillBonus}>
              {t('adminNewItem.createSkillBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddStatBonus}>
              {t('adminNewItem.createStatBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddCharParamBonus}>
              {t('adminNewItem.createCharParamBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddAction}>
              {t('adminNewItem.createActionButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddEffect}>
              {t('adminNewItem.createEffectButton', { ns: 'pages' })}
            </Button>
          </div>
        </div>
        <div className="adminNewItem__intl-title">
          <div className="adminNewItem__intl-title__content">
            <Atitle className="adminNewItem__intl-title__title" level={2}>
              {t('adminNewItem.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminNewItem__intl-title__info">
              {t('adminNewItem.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt(prev => !prev);
            }}
            className="adminNewItem__intl-title__btn"
          />
        </div>
        <div className="adminNewItem__intl">
          <div className="adminNewItem__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameItem.label', { ns: 'fields' })} (FR)`}
              className="adminNewItem__basics__name"
            />
          </div>
          <div className="adminNewItem__details">
            <RichTextElement
              label={`${t('itemSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent=""
              small
              complete
            />
          </div>
        </div>
        <Button type="submit">{t('adminNewItem.createButton', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewItem;
