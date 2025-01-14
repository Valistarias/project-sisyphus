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
  Button, Input, SmartSelect
} from '../../../molecules';
import {
  Alert, RichTextElement, completeRichTextElementExtentions
} from '../../../organisms';
import { possibleStarterKitValues } from '../../../types/items';

import type { ICuratedItem } from '../../../types';

import {
  classTrim, isThereDuplicate
} from '../../../utils';

import './adminEditItem.scss';
import type { ErrorResponseType } from '../../../types/global';

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

const AdminEditItem: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { id } = useParams();
  const {
    setConfirmContent, ConfMessageEvent
  } = useConfirmMessage();
  const {
    skills, stats, charParams, actionTypes, actionDurations, rarities, itemModifiers
  }
    = useGlobalVars();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const navigate = useNavigate();

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

  const rarityList = useMemo(
    () =>
      rarities.map(({ rarity }) => ({
        value: rarity._id,
        label: rarity.title
      })),
    [rarities]
  );

  const itemModifierList = useMemo(
    () =>
      itemModifiers.map(({ itemModifier }) => ({
        value: itemModifier._id,
        label: itemModifier.title
      })),
    [itemModifiers]
  );

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

  const calledApi = useRef(false);

  const [itemData, setItemData] = useState<ICuratedItem | null>(null);

  const [itemText, setItemText] = useState('');
  const [itemTextFr, setItemTextFr] = useState('');

  const introEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const introFrEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const createDefaultData = useCallback((itemData: ICuratedItem | null) => {
    if (itemData == null) {
      return {};
    }
    const {
      item, i18n
    } = itemData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = item.title;
    defaultData.cost = item.cost;
    defaultData.rarity = item.rarity;
    defaultData.itemModifiers = item.itemModifiers;
    defaultData.starterKit = item.starterKit ?? 'never';
    if (i18n.fr !== undefined) {
      defaultData.nameFr = i18n.fr.title ?? '';
    }

    // Init Bonus Skill
    const tempSkillBonusId: number[] = [];
    item.skillBonuses?.forEach((skillBonus) => {
      if (defaultData.skillBonuses === undefined) {
        defaultData.skillBonuses = {};
      }
      defaultData.skillBonuses[`skill-${idIncrement.current}`] = {
        skill: skillBonus.skill,
        value: skillBonus.value
      };

      tempSkillBonusId.push(idIncrement.current);
      idIncrement.current += 1;
    });
    setSkillBonusIds(tempSkillBonusId);

    // Init Bonus Stat
    const tempStatBonusId: number[] = [];
    item.statBonuses?.forEach((statBonus) => {
      if (defaultData.statBonuses === undefined) {
        defaultData.statBonuses = {};
      }
      defaultData.statBonuses[`stat-${idIncrement.current}`] = {
        stat: statBonus.stat,
        value: statBonus.value
      };

      tempStatBonusId.push(idIncrement.current);
      idIncrement.current += 1;
    });
    setStatBonusIds(tempStatBonusId);

    // Init Bonus CharParam
    const tempCharParamBonusId: number[] = [];
    item.charParamBonuses?.forEach((charParamBonus) => {
      if (defaultData.charParamBonuses === undefined) {
        defaultData.charParamBonuses = {};
      }
      defaultData.charParamBonuses[`charParam-${idIncrement.current}`] = {
        charParam: charParamBonus.charParam,
        value: charParamBonus.value
      };

      tempCharParamBonusId.push(idIncrement.current);
      idIncrement.current += 1;
    });
    setCharParamBonusIds(tempCharParamBonusId);

    // Init Actions
    const tempActionId: number[] = [];
    item.actions?.forEach((action) => {
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
    item.effects?.forEach((effect) => {
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
  } = useForm({ defaultValues: useMemo(() => createDefaultData(itemData), [createDefaultData, itemData]) });

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
          message: t('adminEditItem.errorDuplicateSkill', { ns: 'pages' })
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
          message: t('adminEditItem.errorDuplicateStat', { ns: 'pages' })
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
          message: t('adminEditItem.errorDuplicateCharParam', { ns: 'pages' })
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
          id, formula, type, title, summary, titleFr, summaryFr
        }) => ({
          ...(id !== undefined ? { id } : {}),
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
          summaryFr
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
        .update({
          id,
          title: name,
          cost: Number(cost),
          rarity,
          starterKit,
          itemType: itemData?.item.itemType,
          itemModifiers,
          summary: html,
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
                <Ap>{t('adminEditItem.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
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
      id,
      itemData,
      setError,
      t,
      getNewId,
      createAlert
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || itemData === null || confMessageEvt === null) {
      return;
    }
    confMessageEvt.setConfirmContent(
      {
        title: t('adminEditItem.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditItem.confirmDeletion.text', {
          ns: 'pages',
          elt: itemData.item.title
        }),
        confirmCta: t('adminEditItem.confirmDeletion.confirmCta', { ns: 'pages' })
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.items
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditItem.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  )
                });
                void navigate('/admin/items');
              })
              .catch(({ response }) => {
                const { data }: { data: ErrorResponseType } = response;
                if (data.code === 'CYPU-104') {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.skillBranch.name`), 'capitalize') })
                  });
                } else {
                  setError('root.serverError', {
                    type: 'server',
                    message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.skillBranch.name`), 'capitalize') })
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
    itemData,
    t,
    id,
    getNewId,
    createAlert,
    navigate,
    setError
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.items
        .get({ itemId: id })
        .then((curatedItem: ICuratedItem) => {
          const {
            item, i18n
          } = curatedItem;
          setItemData(curatedItem);
          setItemText(item.summary);
          if (i18n.fr !== undefined) {
            setItemTextFr(i18n.fr.summary ?? '');
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

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(itemData));
  }, [
    itemData,
    reset,
    createDefaultData
  ]);

  return (
    <div
      className={classTrim(`
        adminEditItem
        ${displayInt ? 'adminEditItem--int-visible' : ''}
      `)}
    >
      <form className="adminEditItem__content" onSubmit={() => handleSubmit(onSaveItem)} noValidate>
        <div className="adminEditItem__head">
          <Atitle className="adminEditItem__head" level={1}>
            {t('adminEditItem.title', { ns: 'pages' })}
          </Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditItem.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Button className="adminEditItem__return-btn" href="/admin/items" size="small">
          {t('adminEditItem.return', { ns: 'pages' })}
        </Button>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminEditItem__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameItem.required', { ns: 'fields' }) }}
            label={t('nameItem.label', { ns: 'fields' })}
            className="adminEditItem__basics__name"
          />
        </div>
        <div className="adminEditItem__details">
          <RichTextElement
            label={t('itemSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={itemText}
            small
            complete
          />
          <div className="adminEditItem__details__fields">
            <Input
              control={control}
              inputName="cost"
              type="number"
              rules={{ required: t('itemCost.required', { ns: 'fields' }) }}
              label={t('itemCost.label', { ns: 'fields' })}
              className="adminEditItem__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="rarity"
              label={t('itemRarity.label', { ns: 'fields' })}
              rules={{ required: t('itemRarity.required', { ns: 'fields' }) }}
              options={rarityList}
              className="adminEditItem__details__fields__elt"
            />
            <SmartSelect
              control={control}
              isMulti
              inputName="itemModifiers"
              label={t('itemModifiers.label', { ns: 'fields' })}
              options={itemModifierList}
              className="adminEditItem__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="starterKit"
              label={t('programStarterKit.label', { ns: 'fields' })}
              options={starterKitList}
              className="adminEditProgram__details__fields__elt"
            />
          </div>
        </div>
        <Atitle className="adminEditItem__bonus-title" level={2}>
          {t('adminEditItem.values', { ns: 'pages' })}
        </Atitle>
        <div className="adminEditItem__bonuses">
          <div className="adminEditItem__bonuses__elts">
            {skillBonusIds.map(skillBonusId => (
              <div className="adminEditItem__bonus" key={`skill-${skillBonusId}`}>
                <Atitle className="adminEditItem__bonus__title" level={4}>
                  {t('adminEditItem.skillBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditItem__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.skill`}
                    rules={{ required: t('skillBonusSkill.required', { ns: 'fields' }) }}
                    label={t('skillBonusSkill.label', { ns: 'fields' })}
                    options={skillSelect}
                    className="adminEditItem__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`skillBonuses.skill-${skillBonusId}.value`}
                    type="number"
                    rules={{ required: t('skillBonusValue.required', { ns: 'fields' }) }}
                    label={t('skillBonusValue.label', { ns: 'fields' })}
                    className="adminEditItem__bonus__value"
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
                  className="adminEditItem__bonus__button"
                />
              </div>
            ))}
            {statBonusIds.map(statBonusId => (
              <div className="adminEditItem__bonus" key={`stat-${statBonusId}`}>
                <Atitle className="adminEditItem__bonus__title" level={4}>
                  {t('adminEditItem.statBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditItem__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.stat`}
                    rules={{ required: t('statBonusStat.required', { ns: 'fields' }) }}
                    label={t('statBonusStat.label', { ns: 'fields' })}
                    options={statSelect}
                    className="adminEditItem__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`statBonuses.stat-${statBonusId}.value`}
                    type="number"
                    rules={{ required: t('statBonusValue.required', { ns: 'fields' }) }}
                    label={t('statBonusValue.label', { ns: 'fields' })}
                    className="adminEditItem__bonus__value"
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
                  className="adminEditItem__bonus__button"
                />
              </div>
            ))}
            {charParamBonusIds.map(charParamBonusId => (
              <div className="adminEditItem__bonus" key={`charParam-${charParamBonusId}`}>
                <Atitle className="adminEditItem__bonus__title" level={4}>
                  {t('adminEditItem.charParamBonusTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditItem__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`charParamBonuses.charParam-${charParamBonusId}.charParam`}
                    rules={{ required: t('charParamBonusStat.required', { ns: 'fields' }) }}
                    label={t('charParamBonusStat.label', { ns: 'fields' })}
                    options={charParamSelect}
                    className="adminEditItem__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`charParamBonuses.charParam-${charParamBonusId}.value`}
                    type="number"
                    rules={{ required: t('charParamBonusValue.required', { ns: 'fields' }) }}
                    label={t('charParamBonusValue.label', { ns: 'fields' })}
                    className="adminEditItem__bonus__value"
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
                  className="adminEditItem__bonus__button"
                />
              </div>
            ))}
            {effectIds.map(effectId => (
              <div className="adminEditItem__bonus" key={`charParam-${effectId}`}>
                <Atitle className="adminEditItem__bonus__title" level={4}>
                  {t('adminEditItem.effectTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditItem__bonus__fields adminEditItem__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.title`}
                    rules={{ required: t('effectTitle.required', { ns: 'fields' }) }}
                    label={t('effectTitle.label', { ns: 'fields' })}
                    className="adminEditItem__bonus__value adminEditItem__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`effects.effect-${effectId}.type`}
                    rules={{ required: t('effectType.required', { ns: 'fields' }) }}
                    label={t('effectType.label', { ns: 'fields' })}
                    options={actionTypeSelect}
                    className="adminEditItem__bonus__select adminEditItem__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`effects.effect-${effectId}.summary`}
                    rules={{ required: t('effectSummary.required', { ns: 'fields' }) }}
                    label={t('effectSummary.label', { ns: 'fields' })}
                    className="adminEditItem__bonus__value adminEditItem__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.formula`}
                    label={t('effectFormula.label', { ns: 'fields' })}
                    className="adminEditItem__bonus__value adminEditItem__bonus__value--l"
                  />
                  <Atitle className="adminEditItem__bonus__title" level={4}>
                    {t('adminEditItem.effectInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`effects.effect-${effectId}.titleFr`}
                    label={`${t('effectTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminEditItem__bonus__value adminEditItem__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`effects.effect-${effectId}.summaryFr`}
                    label={`${t('effectSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminEditItem__bonus__value adminEditItem__bonus__value--l"
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
                  className="adminEditItem__bonus__button"
                />
              </div>
            ))}
            {actionIds.map(actionId => (
              <div className="adminEditItem__bonus" key={`charParam-${actionId}`}>
                <Atitle className="adminEditItem__bonus__title" level={4}>
                  {t('adminEditItem.actionTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditItem__bonus__fields adminEditItem__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.title`}
                    rules={{ required: t('actionTitle.required', { ns: 'fields' }) }}
                    label={t('actionTitle.label', { ns: 'fields' })}
                    className="adminEditItem__bonus__value adminEditItem__bonus__value--l"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.type`}
                    rules={{ required: t('actionType.required', { ns: 'fields' }) }}
                    label={t('actionType.label', { ns: 'fields' })}
                    options={actionTypeSelect}
                    className="adminEditItem__bonus__select adminEditItem__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.duration`}
                    rules={{ required: t('actionDuration.required', { ns: 'fields' }) }}
                    label={t('actionDuration.label', { ns: 'fields' })}
                    options={actionDurationSelect}
                    className="adminEditItem__bonus__select adminEditItem__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`actions.action-${actionId}.summary`}
                    rules={{ required: t('actionSummary.required', { ns: 'fields' }) }}
                    label={t('actionSummary.label', { ns: 'fields' })}
                    className="adminEditItem__bonus__value adminEditItem__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.time`}
                    label={t('actionTime.label', { ns: 'fields' })}
                    className="adminEditItem__bonus__value adminEditItem__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.damages`}
                    label={t('actionDamages.label', { ns: 'fields' })}
                    className="adminEditItem__bonus__value adminEditItem__bonus__value--s"
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
                    className="adminEditItem__bonus__select adminEditItem__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.offsetSkill`}
                    label={t('actionOffsetSkill.label', { ns: 'fields' })}
                    className="adminEditItem__bonus__value adminEditItem__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`actions.action-${actionId}.isKarmic`}
                    label={t('actionIsKarmic.label', { ns: 'fields' })}
                    options={boolRange}
                    className="adminEditItem__bonus__select adminEditItem__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="number"
                    inputName={`actions.action-${actionId}.karmicCost`}
                    label={t('actionKarmicCost.label', { ns: 'fields' })}
                    className="adminEditItem__bonus__value adminEditItem__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="number"
                    inputName={`actions.action-${actionId}.uses`}
                    label={t('actionUses.label', { ns: 'fields' })}
                    className="adminEditItem__bonus__value adminEditItem__bonus__value--l"
                  />
                  <Atitle className="adminEditItem__bonus__title" level={4}>
                    {t('adminEditItem.actionInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.titleFr`}
                    label={`${t('actionTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminEditItem__bonus__value adminEditItem__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`actions.action-${actionId}.summaryFr`}
                    label={`${t('actionSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminEditItem__bonus__value adminEditItem__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`actions.action-${actionId}.timeFr`}
                    label={`${t('actionTime.label', { ns: 'fields' })} (FR)`}
                    className="adminEditItem__bonus__value adminEditItem__bonus__value--l"
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
                  className="adminEditItem__bonus__button"
                />
              </div>
            ))}
          </div>
          <div className="adminEditItem__bonuses__buttons">
            <Button onClick={onAddSkillBonus}>
              {t('adminEditItem.createSkillBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddStatBonus}>
              {t('adminEditItem.createStatBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddCharParamBonus}>
              {t('adminEditItem.createCharParamBonusButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddAction}>
              {t('adminEditItem.createActionButton', { ns: 'pages' })}
            </Button>
            <Button onClick={onAddEffect}>
              {t('adminEditItem.createEffectButton', { ns: 'pages' })}
            </Button>
          </div>
        </div>
        <div className="adminEditItem__intl-title">
          <div className="adminEditItem__intl-title__content">
            <Atitle className="adminEditItem__intl-title__title" level={2}>
              {t('adminEditItem.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditItem__intl-title__info">
              {t('adminEditItem.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt(prev => !prev);
            }}
            className="adminEditItem__intl-title__btn"
          />
        </div>
        <div className="adminEditItem__intl">
          <div className="adminEditItem__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameItem.label', { ns: 'fields' })} (FR)`}
              className="adminEditItem__basics__name"
            />
          </div>
          <div className="adminEditItem__details">
            <RichTextElement
              label={`${t('itemSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent={itemTextFr}
              small
              complete
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditItem.createButton', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditItem;
