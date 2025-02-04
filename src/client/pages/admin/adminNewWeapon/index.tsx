import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input, SmartSelect } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';
import { possibleStarterKitValues } from '../../../types/items';

import type { ErrorResponseType, InternationalizationType } from '../../../types/global';

import { isThereDuplicate } from '../../../utils';

import './adminNewWeapon.scss';

interface FormValues {
  name: string;
  nameFr: string;
  quote: string;
  quoteFr: string;
  starterKit: string;
  weaponType: string;
  weaponScope: string;
  magasine?: number;
  ammoPerShot?: number;
  cost: number;
  rarity: string;
  itemModifiers: string[];
  damages?: Record<
    string,
    {
      damageType: string;
      dices: string;
    }
  >;
  effects?: Record<
    string,
    {
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
      title: string;
      titleFr?: string;
      summary: string;
      summaryFr?: string;
      type: string;
      skill: string;
      duration: string;
      time?: string;
      timeFr?: string;
      damages?: string;
      offsetSkill?: string;
      uses?: number;
      isKarmic?: boolean;
      karmicCost?: number;
    }
  >;
}

const AdminNewWeapon: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const {
    weaponTypes,
    weaponScopes,
    itemModifiers,
    rarities,
    damageTypes,
    actionTypes,
    actionDurations,
    skills,
  } = useGlobalVars();

  const [, setLoading] = useState(true);
  const calledApi = useRef(false);

  const idIncrement = useRef(0);
  const [damagesIds, setDamagesIds] = useState<number[]>([]);
  const [effectIds, setEffectIds] = useState<number[]>([]);
  const [actionIds, setActionIds] = useState<number[]>([]);

  const introEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const introFrEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
    unregister,
  } = useForm();

  // TODO: Internationalization
  const weaponTypeList = useMemo(
    () =>
      weaponTypes.map(({ weaponType }) => ({
        value: weaponType._id,
        label: weaponType.title,
      })),
    [weaponTypes]
  );

  const weaponScopeList = useMemo(
    () =>
      weaponScopes.map(({ weaponScope }) => ({
        value: weaponScope._id,
        label: weaponScope.title,
      })),
    [weaponScopes]
  );

  const damageTypeList = useMemo(
    () =>
      damageTypes.map(({ damageType }) => ({
        value: damageType._id,
        label: damageType.title,
      })),
    [damageTypes]
  );

  const itemModifierList = useMemo(
    () =>
      itemModifiers.map(({ itemModifier }) => ({
        value: itemModifier._id,
        label: itemModifier.title,
      })),
    [itemModifiers]
  );

  const rarityList = useMemo(
    () =>
      rarities.map(({ rarity }) => ({
        value: rarity._id,
        label: rarity.title,
      })),
    [rarities]
  );

  const actionTypeSelect = useMemo(
    () =>
      actionTypes.map(({ name, _id }) => ({
        value: _id,
        label: t(`terms.actionType.${name}`),
      })),
    [actionTypes, t]
  );

  const starterKitList = useMemo(
    () =>
      possibleStarterKitValues.map((possibleStarterKitValue) => ({
        value: possibleStarterKitValue,
        label: t(`terms.starterKit.${possibleStarterKitValue}`),
      })),
    [t]
  );

  const actionDurationSelect = useMemo(
    () =>
      actionDurations.map(({ name, _id }) => ({
        value: _id,
        label: t(`terms.actionDuration.${name}`),
      })),
    [actionDurations, t]
  );

  const skillSelect = useMemo(
    () =>
      skills.map(({ skill }) => ({
        value: skill._id,
        // TODO : Handle Internationalization
        label: skill.title,
      })),
    [skills]
  );

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
      starterKit,
      itemModifiers,
      magasine,
      ammoPerShot,
      damages,
      effects,
      actions,
    }) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }

      // Check duplicate on character param
      const sortedDamages = damages !== undefined ? Object.values(damages) : [];
      let duplicateDamages = false;
      if (sortedDamages.length > 0) {
        duplicateDamages = isThereDuplicate(sortedDamages.map((damage) => damage.damageType));
      }
      if (duplicateDamages) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminNewNode.errorDuplicateCharParam', { ns: 'pages' }),
        });

        return;
      }

      const curatedDamages = sortedDamages.map(({ damageType, dices }) => ({
        damageType,
        dices,
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
          summaryFr,
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

      let i18n: InternationalizationType | null = null;

      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        i18n = {
          fr: {
            title: nameFr,
            summary: htmlFr,
            quote: quoteFr,
          },
        };
      }

      api.weapons
        .create({
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
          actions: curatedActions,
        })
        .then((weaponType) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewWeapon.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          void navigate(`/admin/weapon/${weaponType._id}`);
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          setError('root.serverError', {
            type: 'server',
            message: t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`terms.charparamsType.${data.sent}`), 'capitalize'),
            }),
          });
        });
    },
    [introEditor, introFrEditor, api, getNewId, createAlert, t, navigate, setError]
  );

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
    }
  }, [api, createAlert, getNewId, t]);

  return (
    <div className="adminNewWeapon">
      <form
        className="adminNewWeapon__content"
        onSubmit={(evt) => {
          void handleSubmit(onSaveWeapon)(evt);
        }}
        noValidate
      >
        <Atitle level={1}>{t('adminNewWeapon.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewWeapon__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameWeapon.required', { ns: 'fields' }) }}
            label={t('nameWeapon.label', { ns: 'fields' })}
            className="adminNewWeapon__basics__name"
          />
          <div className="adminNewWeapon__basics__class">
            <SmartSelect
              control={control}
              inputName="weaponType"
              label={t('weaponType.label', { ns: 'fields' })}
              rules={{ required: t('weaponType.required', { ns: 'fields' }) }}
              options={weaponTypeList}
              className="adminNewWeapon__basics__weaponType"
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
        <div className="adminNewWeapon__details">
          <RichTextElement
            label={t('weaponTypeSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
          <Input
            control={control}
            inputName="quote"
            type="text"
            label={t('quoteWeapon.label', { ns: 'fields' })}
            className="adminNewWeapon__details__quote"
          />
          <div className="adminNewWeapon__details__fields">
            <Input
              control={control}
              inputName="cost"
              type="number"
              rules={{ required: t('weaponCost.required', { ns: 'fields' }) }}
              label={t('weaponCost.label', { ns: 'fields' })}
              className="adminNewWeapon__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="rarity"
              label={t('weaponRarity.label', { ns: 'fields' })}
              rules={{ required: t('weaponRarity.required', { ns: 'fields' }) }}
              options={rarityList}
              className="adminNewWeapon__details__fields__elt"
            />
            <SmartSelect
              control={control}
              isMulti
              inputName="itemModifiers"
              label={t('itemModifiers.label', { ns: 'fields' })}
              options={itemModifierList}
              className="adminNewWeapon__details__fields__elt"
            />
          </div>
          <div className="adminNewWeapon__details__fields">
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
              className="adminNewWeapon__details__fields__elt"
            />
          </div>
        </div>
        <Atitle className="adminNewWeapon__bonus-title" level={2}>
          {t('adminNewWeapon.values', { ns: 'pages' })}
        </Atitle>
        <div className="adminNewWeapon__bonuses">
          <div className="adminNewWeapon__bonuses__elts">
            {damagesIds.map((damagesId) => (
              <div className="adminNewWeapon__bonus" key={`damage-${damagesId}`}>
                <Atitle className="adminNewWeapon__bonus__title" level={4}>
                  {t('adminNewWeapon.damageTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewWeapon__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`damages.damage-${damagesId}.damageType`}
                    rules={{ required: t('damagesType.required', { ns: 'fields' }) }}
                    label={t('damagesType.label', { ns: 'fields' })}
                    options={damageTypeList}
                    className="adminNewWeapon__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`damages.damage-${damagesId}.dices`}
                    type="text"
                    rules={{ required: t('damagesValue.required', { ns: 'fields' }) }}
                    label={t('damagesValue.label', { ns: 'fields' })}
                    className="adminNewWeapon__bonus__value"
                  />
                </div>
                <Button
                  icon="Delete"
                  theme="afterglow"
                  onClick={() => {
                    setDamagesIds((prev) =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== damagesId) {
                          result.push(elt);
                        }

                        return result;
                      }, [])
                    );
                    unregister(`damages.damage-${damagesId}`);
                  }}
                  className="adminNewWeapon__bonus__button"
                />
              </div>
            ))}
            {effectIds.map((effectId) => (
              <div className="adminNewWeapon__bonus" key={`charParam-${effectId}`}>
                <Atitle className="adminNewWeapon__bonus__title" level={4}>
                  {t('adminNewWeapon.effectTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewWeapon__bonus__fields adminNewWeapon__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.title`}
                    rules={{ required: t('effectTitle.required', { ns: 'fields' }) }}
                    label={t('effectTitle.label', { ns: 'fields' })}
                    className="adminNewWeapon__bonus__value adminNewWeapon__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`effects.effect-${effectId}.type`}
                    rules={{ required: t('effectType.required', { ns: 'fields' }) }}
                    label={t('effectType.label', { ns: 'fields' })}
                    options={actionTypeSelect}
                    className="adminNewWeapon__bonus__select adminNewWeapon__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`effects.effect-${effectId}.summary`}
                    rules={{ required: t('effectSummary.required', { ns: 'fields' }) }}
                    label={t('effectSummary.label', { ns: 'fields' })}
                    className="adminNewWeapon__bonus__value adminNewWeapon__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.formula`}
                    label={t('effectFormula.label', { ns: 'fields' })}
                    className="adminNewWeapon__bonus__value adminNewWeapon__bonus__value--l"
                  />
                  <Atitle className="adminNewWeapon__bonus__title" level={4}>
                    {t('adminNewWeapon.effectInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.titleFr`}
                    label={`${t('effectTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminNewWeapon__bonus__value adminNewWeapon__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`effects.effect-${effectId}.summaryFr`}
                    label={`${t('effectSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminNewWeapon__bonus__value adminNewWeapon__bonus__value--l"
                  />
                </div>
                <Button
                  icon="Delete"
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
                  className="adminNewWeapon__bonus__button"
                />
              </div>
            ))}
            {actionIds.map((actionId) => (
              <div className="adminNewWeapon__bonus" key={`charParam-${actionId}`}>
                <Atitle className="adminNewWeapon__bonus__title" level={4}>
                  {t('adminNewWeapon.actionTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewWeapon__bonus__fields adminNewWeapon__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.title`}
                    rules={{ required: t('actionTitle.required', { ns: 'fields' }) }}
                    label={t('actionTitle.label', { ns: 'fields' })}
                    className="adminNewWeapon__bonus__value adminNewWeapon__bonus__value--l"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.type`}
                    rules={{ required: t('actionType.required', { ns: 'fields' }) }}
                    label={t('actionType.label', { ns: 'fields' })}
                    options={actionTypeSelect}
                    className="adminNewWeapon__bonus__select adminNewWeapon__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.duration`}
                    rules={{ required: t('actionDuration.required', { ns: 'fields' }) }}
                    label={t('actionDuration.label', { ns: 'fields' })}
                    options={actionDurationSelect}
                    className="adminNewWeapon__bonus__select adminNewWeapon__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`actions.action-${actionId}.summary`}
                    rules={{ required: t('actionSummary.required', { ns: 'fields' }) }}
                    label={t('actionSummary.label', { ns: 'fields' })}
                    className="adminNewWeapon__bonus__value adminNewWeapon__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.time`}
                    label={t('actionTime.label', { ns: 'fields' })}
                    className="adminNewWeapon__bonus__value adminNewWeapon__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.damages`}
                    label={t('actionDamages.label', { ns: 'fields' })}
                    className="adminNewWeapon__bonus__value adminNewWeapon__bonus__value--s"
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
                    className="adminNewWeapon__bonus__select adminNewWeapon__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.offsetSkill`}
                    label={t('actionOffsetSkill.label', { ns: 'fields' })}
                    className="adminNewWeapon__bonus__value adminNewWeapon__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.isKarmic`}
                    label={t('actionIsKarmic.label', { ns: 'fields' })}
                    options={boolRange}
                    className="adminNewWeapon__bonus__select adminNewWeapon__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="number"
                    inputName={`actions.action-${actionId}.karmicCost`}
                    label={t('actionKarmicCost.label', { ns: 'fields' })}
                    className="adminNewWeapon__bonus__value adminNewWeapon__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="number"
                    inputName={`actions.action-${actionId}.uses`}
                    label={t('actionUses.label', { ns: 'fields' })}
                    className="adminNewWeapon__bonus__value adminNewWeapon__bonus__value--l"
                  />
                  <Atitle className="adminNewWeapon__bonus__title" level={4}>
                    {t('adminNewWeapon.actionInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.titleFr`}
                    label={`${t('actionTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminNewWeapon__bonus__value adminNewWeapon__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`actions.action-${actionId}.summaryFr`}
                    label={`${t('actionSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminNewWeapon__bonus__value adminNewWeapon__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.timeFr`}
                    label={`${t('actionTime.label', { ns: 'fields' })} (FR)`}
                    className="adminNewWeapon__bonus__value adminNewWeapon__bonus__value--l"
                  />
                </div>
                <Button
                  icon="Delete"
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
                  className="adminNewWeapon__bonus__button"
                />
              </div>
            ))}
          </div>
          <div className="adminNewWeapon__bonuses__buttons">
            <Button onClick={onAddDamage}>
              {t('adminNewWeapon.createDamageButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddAction}>
              {t('adminNewWeapon.createActionButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddEffect}>
              {t('adminNewWeapon.createEffectButton', { ns: 'pages' })}
            </Button>
          </div>
        </div>
        <Atitle className="adminNewWeapon__intl" level={2}>
          {t('adminNewWeapon.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewWeapon__intl-info">
          {t('adminNewWeapon.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewWeapon__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameWeapon.label', { ns: 'fields' })} (FR)`}
            className="adminNewWeapon__basics__name"
          />
        </div>
        <div className="adminNewWeapon__details">
          <RichTextElement
            label={`${t('weaponTypeSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent=""
            small
            complete
          />
          <Input
            control={control}
            inputName="quoteFr"
            type="text"
            label={`${t('quoteWeapon.label', { ns: 'fields' })} (FR)`}
            className="adminNewWeapon__details__quote"
          />
        </div>
        <Button type="submit">{t('adminNewWeapon.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewWeapon;
