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

import './adminNewArmor.scss';

interface FormValues {
  name: string
  nameFr: string
  cost: number
  rarity: string
  starterKit: string
  armorType: string
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

const AdminNewArmor: FC = () => {
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
    armorTypes,
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

  const armorTypeSelect = useMemo(
    () =>
      armorTypes.map(({ armorType }) => ({
        value: armorType._id,
        label: armorType.title
      })),
    [armorTypes]
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
          skillBonuses.map(skillBonus => skillBonus.skill)
        );
      }
      if (duplicateSkillBonuses) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminNewArmor.errorDuplicateSkill', { ns: 'pages' })
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
          message: t('adminNewArmor.errorDuplicateStat', { ns: 'pages' })
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
          message: t('adminNewArmor.errorDuplicateCharParam', { ns: 'pages' })
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

      api.armors
        .create({
          title: name,
          cost: Number(cost),
          rarity,
          starterKit,
          summary: html,
          itemType: itemTypes.find(itemType => itemType.name === 'shi')?._id ?? undefined,
          itemModifiers,
          armorType,
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
                <Ap>{t('adminNewArmor.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          void navigate(`/admin/armor/${quote._id}`);
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
        adminNewArmor
        ${displayInt ? 'adminNewArmor--int-visible' : ''}
      `)}
    >
      <form className="adminNewArmor__content" onSubmit={handleSubmit(onSaveArmor)} noValidate>
        <Atitle className="adminNewArmor__head" level={1}>
          {t('adminNewArmor.title', { ns: 'pages' })}
        </Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminNewArmor__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameArmor.required', { ns: 'fields' }) }}
            label={t('nameArmor.label', { ns: 'fields' })}
            className="adminNewArmor__basics__name"
          />
          <div className="adminNewArmor__basics__class">
            <SmartSelect
              control={control}
              inputName="armorType"
              isMulti
              rules={{ required: t('armorType.required', { ns: 'fields' }) }}
              label={t('armorType.label', { ns: 'fields' })}
              options={armorTypeSelect}
              className="adminNewArmor__basics__type"
            />
          </div>
        </div>
        <div className="adminNewArmor__details">
          <RichTextElement
            label={t('armorSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
          <div className="adminNewArmor__details__fields">
            <Input
              control={control}
              inputName="cost"
              type="number"
              rules={{ required: t('armorCost.required', { ns: 'fields' }) }}
              label={t('armorCost.label', { ns: 'fields' })}
              className="adminNewArmor__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="rarity"
              label={t('armorRarity.label', { ns: 'fields' })}
              rules={{ required: t('armorRarity.required', { ns: 'fields' }) }}
              options={rarityList}
              className="adminNewArmor__details__fields__elt"
            />
            <SmartSelect
              control={control}
              isMulti
              inputName="itemModifiers"
              label={t('itemModifiers.label', { ns: 'fields' })}
              options={itemModifierList}
              className="adminNewArmor__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="starterKit"
              label={t('armorStarterKit.label', { ns: 'fields' })}
              options={starterKitList}
              className="adminNewArmor__details__fields__elt"
            />
          </div>
        </div>
        <Atitle className="adminNewArmor__bonus-title" level={2}>
          {t('adminNewArmor.values', { ns: 'pages' })}
        </Atitle>
        <div className="adminNewArmor__bonuses">
          <div className="adminNewArmor__bonuses__elts">
            {skillBonusIds.map(skillBonusId => (
              <div className="adminNewArmor__bonus" key={`skill-${skillBonusId}`}>
                <Atitle className="adminNewArmor__bonus__title" level={4}>
                  {t('adminNewArmor.skillBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewArmor__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.skill`}
                    rules={{ required: t('skillBonusSkill.required', { ns: 'fields' }) }}
                    label={t('skillBonusSkill.label', { ns: 'fields' })}
                    options={skillSelect}
                    className="adminNewArmor__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.value`}
                    type="number"
                    rules={{ required: t('skillBonusValue.required', { ns: 'fields' }) }}
                    label={t('skillBonusValue.label', { ns: 'fields' })}
                    className="adminNewArmor__bonus__value"
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
                  className="adminNewArmor__bonus__button"
                />
              </div>
            ))}
            {statBonusIds.map(statBonusId => (
              <div className="adminNewArmor__bonus" key={`stat-${statBonusId}`}>
                <Atitle className="adminNewArmor__bonus__title" level={4}>
                  {t('adminNewArmor.statBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewArmor__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.stat`}
                    rules={{ required: t('statBonusStat.required', { ns: 'fields' }) }}
                    label={t('statBonusStat.label', { ns: 'fields' })}
                    options={statSelect}
                    className="adminNewArmor__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.value`}
                    type="number"
                    rules={{ required: t('statBonusValue.required', { ns: 'fields' }) }}
                    label={t('statBonusValue.label', { ns: 'fields' })}
                    className="adminNewArmor__bonus__value"
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
                  className="adminNewArmor__bonus__button"
                />
              </div>
            ))}
            {charParamBonusIds.map(charParamBonusId => (
              <div className="adminNewArmor__bonus" key={`charParam-${charParamBonusId}`}>
                <Atitle className="adminNewArmor__bonus__title" level={4}>
                  {t('adminNewArmor.charParamBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewArmor__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`charParamBonuses.charParam-${charParamBonusId}.charParam`}
                    rules={{ required: t('charParamBonusStat.required', { ns: 'fields' }) }}
                    label={t('charParamBonusStat.label', { ns: 'fields' })}
                    options={charParamSelect}
                    className="adminNewArmor__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`charParamBonuses.charParam-${charParamBonusId}.value`}
                    type="number"
                    rules={{ required: t('charParamBonusValue.required', { ns: 'fields' }) }}
                    label={t('charParamBonusValue.label', { ns: 'fields' })}
                    className="adminNewArmor__bonus__value"
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
                  className="adminNewArmor__bonus__button"
                />
              </div>
            ))}
            {effectIds.map(effectId => (
              <div className="adminNewArmor__bonus" key={`charParam-${effectId}`}>
                <Atitle className="adminNewArmor__bonus__title" level={4}>
                  {t('adminNewArmor.effectTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewArmor__bonus__fields adminNewArmor__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.title`}
                    rules={{ required: t('effectTitle.required', { ns: 'fields' }) }}
                    label={t('effectTitle.label', { ns: 'fields' })}
                    className="adminNewArmor__bonus__value adminNewArmor__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`effects.effect-${effectId}.type`}
                    rules={{ required: t('effectType.required', { ns: 'fields' }) }}
                    label={t('effectType.label', { ns: 'fields' })}
                    options={actionTypeSelect}
                    className="adminNewArmor__bonus__select adminNewArmor__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`effects.effect-${effectId}.summary`}
                    rules={{ required: t('effectSummary.required', { ns: 'fields' }) }}
                    label={t('effectSummary.label', { ns: 'fields' })}
                    className="adminNewArmor__bonus__value adminNewArmor__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.formula`}
                    label={t('effectFormula.label', { ns: 'fields' })}
                    className="adminNewArmor__bonus__value adminNewArmor__bonus__value--l"
                  />
                  <Atitle className="adminNewArmor__bonus__title" level={4}>
                    {t('adminNewArmor.effectInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.titleFr`}
                    label={`${t('effectTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminNewArmor__bonus__value adminNewArmor__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`effects.effect-${effectId}.summaryFr`}
                    label={`${t('effectSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminNewArmor__bonus__value adminNewArmor__bonus__value--l"
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
                  className="adminNewArmor__bonus__button"
                />
              </div>
            ))}
            {actionIds.map(actionId => (
              <div className="adminNewArmor__bonus" key={`charParam-${actionId}`}>
                <Atitle className="adminNewArmor__bonus__title" level={4}>
                  {t('adminNewArmor.actionTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewArmor__bonus__fields adminNewArmor__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.title`}
                    rules={{ required: t('actionTitle.required', { ns: 'fields' }) }}
                    label={t('actionTitle.label', { ns: 'fields' })}
                    className="adminNewArmor__bonus__value adminNewArmor__bonus__value--l"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.type`}
                    rules={{ required: t('actionType.required', { ns: 'fields' }) }}
                    label={t('actionType.label', { ns: 'fields' })}
                    options={actionTypeSelect}
                    className="adminNewArmor__bonus__select adminNewArmor__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.duration`}
                    rules={{ required: t('actionDuration.required', { ns: 'fields' }) }}
                    label={t('actionDuration.label', { ns: 'fields' })}
                    options={actionDurationSelect}
                    className="adminNewArmor__bonus__select adminNewArmor__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`actions.action-${actionId}.summary`}
                    rules={{ required: t('actionSummary.required', { ns: 'fields' }) }}
                    label={t('actionSummary.label', { ns: 'fields' })}
                    className="adminNewArmor__bonus__value adminNewArmor__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.time`}
                    label={t('actionTime.label', { ns: 'fields' })}
                    className="adminNewArmor__bonus__value adminNewArmor__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.damages`}
                    label={t('actionDamages.label', { ns: 'fields' })}
                    className="adminNewArmor__bonus__value adminNewArmor__bonus__value--s"
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
                    className="adminNewArmor__bonus__select adminNewArmor__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.offsetSkill`}
                    label={t('actionOffsetSkill.label', { ns: 'fields' })}
                    className="adminNewArmor__bonus__value adminNewArmor__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.isKarmic`}
                    label={t('actionIsKarmic.label', { ns: 'fields' })}
                    options={boolRange}
                    className="adminNewArmor__bonus__select adminNewArmor__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="number"
                    inputName={`actions.action-${actionId}.karmicCost`}
                    label={t('actionKarmicCost.label', { ns: 'fields' })}
                    className="adminNewArmor__bonus__value adminNewArmor__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="number"
                    inputName={`actions.action-${actionId}.uses`}
                    label={t('actionUses.label', { ns: 'fields' })}
                    className="adminNewArmor__bonus__value adminNewArmor__bonus__value--l"
                  />
                  <Atitle className="adminNewArmor__bonus__title" level={4}>
                    {t('adminNewArmor.actionInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.titleFr`}
                    label={`${t('actionTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminNewArmor__bonus__value adminNewArmor__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`actions.action-${actionId}.summaryFr`}
                    label={`${t('actionSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminNewArmor__bonus__value adminNewArmor__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.timeFr`}
                    label={`${t('actionTime.label', { ns: 'fields' })} (FR)`}
                    className="adminNewArmor__bonus__value adminNewArmor__bonus__value--l"
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
                  className="adminNewArmor__bonus__button"
                />
              </div>
            ))}
          </div>
          <div className="adminNewArmor__bonuses__buttons">
            <Button onClick={onAddSkillBonus}>
              {t('adminNewArmor.createSkillBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddStatBonus}>
              {t('adminNewArmor.createStatBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddCharParamBonus}>
              {t('adminNewArmor.createCharParamBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddAction}>
              {t('adminNewArmor.createActionButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddEffect}>
              {t('adminNewArmor.createEffectButton', { ns: 'pages' })}
            </Button>
          </div>
        </div>
        <div className="adminNewArmor__intl-title">
          <div className="adminNewArmor__intl-title__content">
            <Atitle className="adminNewArmor__intl-title__title" level={2}>
              {t('adminNewArmor.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminNewArmor__intl-title__info">
              {t('adminNewArmor.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt(prev => !prev);
            }}
            className="adminNewArmor__intl-title__btn"
          />
        </div>
        <div className="adminNewArmor__intl">
          <div className="adminNewArmor__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameArmor.label', { ns: 'fields' })} (FR)`}
              className="adminNewArmor__basics__name"
            />
          </div>
          <div className="adminNewArmor__details">
            <RichTextElement
              label={`${t('armorSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent=""
              small
              complete
            />
          </div>
        </div>
        <Button type="submit">{t('adminNewArmor.createButton', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewArmor;
