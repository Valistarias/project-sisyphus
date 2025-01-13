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
import { possibleStarterKitValues } from '../../../types/items';

import type { ICuratedWeapon } from '../../../types';

import { classTrim, isThereDuplicate } from '../../../utils';

import './adminEditWeapon.scss';

interface FormValues {
  name: string
  nameFr: string
  quote: string
  quoteFr: string
  weaponType: string
  weaponScope: string
  starterKit: string
  magasine?: number
  ammoPerShot?: number
  cost: number
  rarity: string
  itemModifiers: string[]
  damages?: Record<
    string,
    {
      damageType: string
      dices: string
    }
  >
  effects?: Record<
    string,
    {
      id: string
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
      id: string
      title: string
      titleFr?: string
      summary: string
      summaryFr?: string
      type: string
      skill?: string
      duration: string
      time?: string
      timeFr?: string
      damages?: string
      offsetSkill?: string
      uses?: number
      isKarmic?: string
      karmicCost?: number
    }
  >
}

const AdminEditWeapon: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { id } = useParams();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage() ?? {
    setConfirmContent: () => {},
    ConfMessageEvent: {}
  };
  const {
    weaponTypes,
    weaponScopes,
    itemModifiers,
    rarities,
    damageTypes,
    actionTypes,
    actionDurations,
    skills
  } = useGlobalVars();
  const { createAlert, getNewId } = useSystemAlerts();
  const navigate = useNavigate();

  const [displayInt, setDisplayInt] = useState(false);

  const idIncrement = useRef(0);
  const [damagesIds, setDamagesIds] = useState<number[]>([]);
  const [effectIds, setEffectIds] = useState<number[]>([]);
  const [actionIds, setActionIds] = useState<number[]>([]);

  const calledApi = useRef(false);

  const [weaponData, setWeaponData] = useState<ICuratedWeapon | null>(null);

  const [weaponText, setWeaponText] = useState('');
  const [weaponTextFr, setWeaponTextFr] = useState('');

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const createDefaultData = useCallback((weaponData: ICuratedWeapon | null) => {
    if (weaponData == null) {
      return {};
    }
    const { weapon, i18n } = weaponData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = weapon.title;
    defaultData.weaponType = weapon.weaponType;
    defaultData.quote = weapon.quote;
    defaultData.weaponScope = weapon.weaponScope;
    defaultData.magasine = weapon.magasine;
    defaultData.ammoPerShot = weapon.ammoPerShot;
    defaultData.cost = weapon.cost;
    defaultData.rarity = weapon.rarity;
    defaultData.itemModifiers = weapon.itemModifiers;
    defaultData.starterKit = weapon.starterKit ?? 'never';
    if (i18n.fr !== undefined) {
      defaultData.nameFr = i18n.fr.title ?? '';
      defaultData.quoteFr = i18n.fr.quote ?? '';
    }

    // Init Bonus Skill
    const damageIds: number[] = [];
    weapon.damages.forEach((damage) => {
      if (defaultData.damages === undefined) {
        defaultData.damages = {};
      }
      defaultData.damages[`damage-${idIncrement.current}`] = {
        damageType: damage.damageType,
        dices: damage.dices
      };

      damageIds.push(idIncrement.current);
      idIncrement.current += 1;
    });
    setDamagesIds(damageIds);

    // Init Actions
    const tempActionId: number[] = [];
    weapon.actions?.forEach((action) => {
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
        titleFr: action.i18n.fr.title,
        summaryFr: action.i18n.fr.summary,
        timeFr: action.i18n.fr.time
      };

      tempActionId.push(idIncrement.current);
      idIncrement.current += 1;
    });
    setActionIds(tempActionId);

    // Init Effects
    const tempEffectId: number[] = [];
    weapon.effects?.forEach((effect) => {
      if (defaultData.effects === undefined) {
        defaultData.effects = {};
      }
      defaultData.effects[`effect-${idIncrement.current}`] = {
        id: effect._id,
        title: effect.title,
        type: effect.type,
        formula: effect.formula,
        summary: effect.summary,
        titleFr: effect.i18n.fr.title,
        summaryFr: effect.i18n.fr.summary
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
    reset
  } = useForm({
    defaultValues: useMemo(() => createDefaultData(weaponData), [createDefaultData, weaponData])
  });

  // TODO: Internationalization
  const weaponTypeList = useMemo(() => weaponTypes.map(({ weaponType }) => ({
    value: weaponType._id,
    label: weaponType.title
  })), [weaponTypes]);

  const weaponScopeList = useMemo(() => weaponScopes.map(({ weaponScope }) => ({
    value: weaponScope._id,
    label: weaponScope.title
  })), [weaponScopes]);

  const damageTypeList = useMemo(() => damageTypes.map(({ damageType }) => ({
    value: damageType._id,
    label: damageType.title
  })), [damageTypes]);

  const itemModifierList = useMemo(() => itemModifiers.map(({ itemModifier }) => ({
    value: itemModifier._id,
    label: itemModifier.title
  })), [itemModifiers]);

  const rarityList = useMemo(() => rarities.map(({ rarity }) => ({
    value: rarity._id,
    label: rarity.title
  })), [rarities]);

  const actionTypeSelect = useMemo(
    () =>
      actionTypes.map(({ name, _id }) => ({
        value: _id,
        label: t(`terms.actionType.${name}`)
      })),
    [actionTypes, t]
  );

  const starterKitList = useMemo(
    () =>
      possibleStarterKitValues.map(possibleStarterKitValue => ({
        value: possibleStarterKitValue,
        label: t(`terms.starterKit.${possibleStarterKitValue}`)
      })),
    [t]
  );

  const actionDurationSelect = useMemo(
    () =>
      actionDurations.map(({ name, _id }) => ({
        value: _id,
        label: t(`terms.actionDuration.${name}`)
      })),
    [actionDurations, t]
  );

  const skillSelect = useMemo(
    () =>
      skills.map(({ skill }) => ({
        value: skill._id,
        // TODO : Handle Internationalization
        label: skill.title
      })),
    [skills]
  );

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

  const onAddDamage = useCallback(() => {
    setDamagesIds((prev) => {
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

  const onSaveWeapon: SubmitHandler<FormValues> = useCallback(
    ({
      name,
      nameFr,
      weaponType,
      rarity,
      cost,
      quote,
      quoteFr,
      weaponScope,
      itemModifiers,
      starterKit,
      magasine,
      ammoPerShot,
      damages,
      effects,
      actions
    }) => {
      if (
        introEditor === null
        || introFrEditor === null
        || api === undefined
        || weaponScope === undefined
        || rarity === undefined
      ) {
        return;
      }

      // Check duplicate on character param
      const sortedDamages = damages !== undefined ? Object.values(damages) : [];
      let duplicateDamages = false;
      if (sortedDamages.length > 0) {
        duplicateDamages = isThereDuplicate(sortedDamages.map(damage => damage.damageType));
      }
      if (duplicateDamages) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminNewNode.errorDuplicateCharParam', { ns: 'pages' })
        });

        return;
      }

      const curatedDamages = sortedDamages.map(({ damageType, dices }) => ({
        damageType,
        dices
      }));

      const effectsArr = effects !== undefined ? Object.values(effects) : [];
      const curatedEffects = effectsArr.map(
        ({ formula, type, title, summary, titleFr, summaryFr }) => ({
          title,
          summary,
          formula,
          type,
          i18n: {
            ...(titleFr !== undefined || summaryFr !== undefined
              ? {
                  fr: {
                    title: titleFr,
                    summary: summaryFr
                  }
                }
              : {})
          }
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
          i18n: {
            ...(titleFr !== undefined || summaryFr !== undefined || timeFr !== undefined
              ? {
                  fr: {
                    title: titleFr,
                    summary: summaryFr,
                    time: timeFr
                  }
                }
              : {})
          }
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
            quote: quoteFr
          }
        };
      }

      api.weapons
        .update({
          id,
          title: name,
          weaponType,
          weaponScope,
          rarity,
          cost: Number(cost),
          itemModifiers,
          starterKit,
          summary: html,
          magasine: magasine !== undefined ? Number(magasine) : undefined,
          ammoPerShot: ammoPerShot !== undefined ? Number(ammoPerShot) : undefined,
          i18n,
          quote,
          damages: curatedDamages,
          effects: curatedEffects,
          actions: curatedActions
        })
        .then(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditWeapon.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
        })
        .catch(({ response }) => {
          const { data } = response;
          setError('root.serverError', {
            type: 'server',
            message: t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`terms.charparamsType.${data.sent}`), 'capitalize')
            })
          });
        });
    },
    [introEditor, introFrEditor, api, id, setError, t, getNewId, createAlert]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || weaponData === null) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditWeapon.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditWeapon.confirmDeletion.text', {
          ns: 'pages',
          elt: weaponData.weapon.title
        }),
        confirmCta: t('adminEditWeapon.confirmDeletion.confirmCta', { ns: 'pages' })
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.weapons
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditWeapon.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  )
                });
                void navigate(`/admin/weapons`);
              })
              .catch(({ response }) => {
                const { data } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.skillBranch.name`), 'capitalize')
                    })
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, {
                      field: i18next.format(t(`terms.skillBranch.name`), 'capitalize')
                    })
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
    weaponData,
    setConfirmContent,
    t,
    ConfMessageEvent,
    id,
    getNewId,
    createAlert,
    navigate,
    setError
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.weapons
        .get({ weaponId: id })
        .then((curatedWeapon: ICuratedWeapon) => {
          const { weapon, i18n } = curatedWeapon;
          setWeaponData(curatedWeapon);
          setWeaponText(weapon.summary);
          if (i18n.fr !== undefined) {
            setWeaponTextFr(i18n.fr.summary ?? '');
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
  }, [api, createAlert, getNewId, id, t]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(weaponData));
  }, [weaponData, reset, createDefaultData]);

  return (
    <div
      className={classTrim(`
        adminEditWeapon
        ${displayInt ? 'adminEditWeapon--int-visible' : ''}
      `)}
    >
      <form className="adminEditWeapon__content" onSubmit={handleSubmit(onSaveWeapon)} noValidate>
        <div className="adminEditWeapon__head">
          <Atitle className="adminEditWeapon__head" level={1}>
            {weaponData?.weapon.title ?? ''}
          </Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditWeapon.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Button className="adminEditWeapon__return-btn" href="/admin/weapons" size="small">
          {t('adminEditWeapon.return', { ns: 'pages' })}
        </Button>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminEditWeapon__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameWeapon.required', { ns: 'fields' })
            }}
            label={t('nameWeapon.label', { ns: 'fields' })}
            className="adminEditWeapon__basics__name"
          />
          <div className="adminEditWeapon__basics__class">
            <SmartSelect
              control={control}
              inputName="weaponType"
              label={t('weaponType.label', { ns: 'fields' })}
              rules={{ required: t('weaponType.required', { ns: 'fields' }) }}
              options={weaponTypeList}
              className="adminEditWeapon__basics__weaponType"
            />
            <SmartSelect
              control={control}
              inputName="weaponScope"
              label={t('weaponScope.label', { ns: 'fields' })}
              rules={{ required: t('weaponScope.required', { ns: 'fields' }) }}
              options={weaponScopeList}
            />
          </div>
        </div>
        <div className="adminEditWeapon__details">
          <RichTextElement
            label={t('weaponTypeSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={weaponText}
            small
            complete
          />
          <Input
            control={control}
            inputName="quote"
            type="text"
            label={t('quoteWeapon.label', { ns: 'fields' })}
            className="adminEditWeapon__details__quote"
          />
          <div className="adminEditWeapon__details__fields">
            <Input
              control={control}
              inputName="cost"
              type="number"
              rules={{
                required: t('weaponCost.required', { ns: 'fields' })
              }}
              label={t('weaponCost.label', { ns: 'fields' })}
              className="adminEditWeapon__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="rarity"
              label={t('weaponRarity.label', { ns: 'fields' })}
              rules={{ required: t('weaponRarity.required', { ns: 'fields' }) }}
              options={rarityList}
              className="adminEditWeapon__details__fields__elt"
            />
            <SmartSelect
              control={control}
              isMulti
              inputName="itemModifiers"
              label={t('itemModifiers.label', { ns: 'fields' })}
              options={itemModifierList}
              className="adminEditWeapon__details__fields__elt"
            />
          </div>
          <div className="adminEditWeapon__details__fields">
            <Input
              control={control}
              inputName="magasine"
              type="number"
              label={t('magasineWeapon.label', { ns: 'fields' })}
            />
            <Input
              control={control}
              inputName="ammoPerShot"
              type="number"
              label={t('ammoPerShotWeapon.label', { ns: 'fields' })}
            />
            <SmartSelect
              control={control}
              inputName="starterKit"
              label={t('weaponStarterKit.label', { ns: 'fields' })}
              options={starterKitList}
              className="adminEditWeapon__details__fields__elt"
            />
          </div>
        </div>
        <Atitle className="adminEditWeapon__bonus-title" level={2}>
          {t('adminEditWeapon.values', { ns: 'pages' })}
        </Atitle>
        <div className="adminEditWeapon__bonuses">
          <div className="adminEditWeapon__bonuses__elts">
            {damagesIds.map(damagesId => (
              <div className="adminEditWeapon__bonus" key={`damage-${damagesId}`}>
                <Atitle className="adminEditWeapon__bonus__title" level={4}>
                  {t('adminEditWeapon.damageTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditWeapon__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`damages.damage-${damagesId}.damageType`}
                    rules={{
                      required: t('damagesType.required', { ns: 'fields' })
                    }}
                    label={t('damagesType.label', { ns: 'fields' })}
                    options={damageTypeList}
                    className="adminEditWeapon__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`damages.damage-${damagesId}.dices`}
                    type="text"
                    rules={{
                      required: t('damagesValue.required', { ns: 'fields' })
                    }}
                    label={t('damagesValue.label', { ns: 'fields' })}
                    className="adminEditWeapon__bonus__value"
                  />
                </div>
                <Button
                  icon="Delete"
                  theme="afterglow"
                  onClick={() => {
                    setDamagesIds(prev =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== damagesId) {
                          result.push(elt);
                        }

                        return result;
                      }, [])
                    );
                    unregister(`damages.damage-${damagesId}`);
                  }}
                  className="adminEditWeapon__bonus__button"
                />
              </div>
            ))}
            {effectIds.map(effectId => (
              <div className="adminEditWeapon__bonus" key={`charParam-${effectId}`}>
                <Atitle className="adminEditWeapon__bonus__title" level={4}>
                  {t('adminEditWeapon.effectTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditWeapon__bonus__fields adminEditWeapon__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.title`}
                    rules={{
                      required: t('effectTitle.required', { ns: 'fields' })
                    }}
                    label={t('effectTitle.label', { ns: 'fields' })}
                    className="adminEditWeapon__bonus__value adminEditWeapon__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`effects.effect-${effectId}.type`}
                    rules={{
                      required: t('effectType.required', { ns: 'fields' })
                    }}
                    label={t('effectType.label', { ns: 'fields' })}
                    options={actionTypeSelect}
                    className="adminEditWeapon__bonus__select adminEditWeapon__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`effects.effect-${effectId}.summary`}
                    rules={{
                      required: t('effectSummary.required', { ns: 'fields' })
                    }}
                    label={t('effectSummary.label', { ns: 'fields' })}
                    className="adminEditWeapon__bonus__value adminEditWeapon__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.formula`}
                    label={t('effectFormula.label', { ns: 'fields' })}
                    className="adminEditWeapon__bonus__value adminEditWeapon__bonus__value--l"
                  />
                  <Atitle className="adminEditWeapon__bonus__title" level={4}>
                    {t('adminEditWeapon.effectInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.titleFr`}
                    label={`${t('effectTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminEditWeapon__bonus__value adminEditWeapon__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`effects.effect-${effectId}.summaryFr`}
                    label={`${t('effectSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminEditWeapon__bonus__value adminEditWeapon__bonus__value--l"
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
                  className="adminEditWeapon__bonus__button"
                />
              </div>
            ))}
            {actionIds.map(actionId => (
              <div className="adminEditWeapon__bonus" key={`charParam-${actionId}`}>
                <Atitle className="adminEditWeapon__bonus__title" level={4}>
                  {t('adminEditWeapon.actionTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditWeapon__bonus__fields adminEditWeapon__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.title`}
                    rules={{
                      required: t('actionTitle.required', { ns: 'fields' })
                    }}
                    label={t('actionTitle.label', { ns: 'fields' })}
                    className="adminEditWeapon__bonus__value adminEditWeapon__bonus__value--l"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.type`}
                    rules={{
                      required: t('actionType.required', { ns: 'fields' })
                    }}
                    label={t('actionType.label', { ns: 'fields' })}
                    options={actionTypeSelect}
                    className="adminEditWeapon__bonus__select adminEditWeapon__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.duration`}
                    rules={{
                      required: t('actionDuration.required', { ns: 'fields' })
                    }}
                    label={t('actionDuration.label', { ns: 'fields' })}
                    options={actionDurationSelect}
                    className="adminEditWeapon__bonus__select adminEditWeapon__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`actions.action-${actionId}.summary`}
                    rules={{
                      required: t('actionSummary.required', { ns: 'fields' })
                    }}
                    label={t('actionSummary.label', { ns: 'fields' })}
                    className="adminEditWeapon__bonus__value adminEditWeapon__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.time`}
                    label={t('actionTime.label', { ns: 'fields' })}
                    className="adminEditWeapon__bonus__value adminEditWeapon__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.damages`}
                    label={t('actionDamages.label', { ns: 'fields' })}
                    className="adminEditWeapon__bonus__value adminEditWeapon__bonus__value--s"
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
                    className="adminEditWeapon__bonus__select adminEditWeapon__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.offsetSkill`}
                    label={t('actionOffsetSkill.label', { ns: 'fields' })}
                    className="adminEditWeapon__bonus__value adminEditWeapon__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.isKarmic`}
                    label={t('actionIsKarmic.label', { ns: 'fields' })}
                    options={boolRange}
                    className="adminEditWeapon__bonus__select adminEditWeapon__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="number"
                    inputName={`actions.action-${actionId}.karmicCost`}
                    label={t('actionKarmicCost.label', { ns: 'fields' })}
                    className="adminEditWeapon__bonus__value adminEditWeapon__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="number"
                    inputName={`actions.action-${actionId}.uses`}
                    label={t('actionUses.label', { ns: 'fields' })}
                    className="adminEditWeapon__bonus__value adminEditWeapon__bonus__value--l"
                  />
                  <Atitle className="adminEditWeapon__bonus__title" level={4}>
                    {t('adminEditWeapon.actionInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.titleFr`}
                    label={`${t('actionTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminEditWeapon__bonus__value adminEditWeapon__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`actions.action-${actionId}.summaryFr`}
                    label={`${t('actionSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminEditWeapon__bonus__value adminEditWeapon__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.timeFr`}
                    label={`${t('actionTime.label', { ns: 'fields' })} (FR)`}
                    className="adminEditWeapon__bonus__value adminEditWeapon__bonus__value--l"
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
                  className="adminEditWeapon__bonus__button"
                />
              </div>
            ))}
          </div>
          <div className="adminEditWeapon__bonuses__buttons">
            <Button onClick={onAddDamage}>
              {t('adminEditWeapon.createDamageButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddAction}>
              {t('adminEditWeapon.createActionButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddEffect}>
              {t('adminEditWeapon.createEffectButton', { ns: 'pages' })}
            </Button>
          </div>
        </div>
        <div className="adminEditWeapon__intl-title">
          <div className="adminEditWeapon__intl-title__content">
            <Atitle className="adminEditWeapon__intl-title__title" level={2}>
              {t('adminEditWeapon.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditWeapon__intl-title__info">
              {t('adminEditWeapon.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt(prev => !prev);
            }}
            className="adminEditWeapon__intl-title__btn"
          />
        </div>
        <div className="adminEditWeapon__intl">
          <div className="adminEditWeapon__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameWeapon.label', { ns: 'fields' })} (FR)`}
              className="adminEditWeapon__basics__name"
            />
          </div>
          <div className="adminEditWeapon__details">
            <RichTextElement
              label={`${t('weaponSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent={weaponTextFr}
              small
              complete
            />
            <Input
              control={control}
              inputName="quoteFr"
              type="text"
              label={`${t('quoteWeapon.label', { ns: 'fields' })} (FR)`}
              className="adminEditWeapon__details__quote"
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditWeapon.edit', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditWeapon;
