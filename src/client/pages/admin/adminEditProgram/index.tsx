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

import type { ICuratedBasicNPC, ICuratedProgram } from '../../../types';

import { classTrim, isThereDuplicate } from '../../../utils';

import './adminEditProgram.scss';

interface FormValues {
  name: string
  nameFr: string
  programScope: string
  uses?: number
  radius?: number
  ram: number
  cost: number
  rarity: string
  starterKit: string
  ai: string
  aiSummoned?: number
  damages?: Record<
    string,
    {
      damageType: string
      dices: string
    }
  >
}

const AdminEditProgram: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { id } = useParams();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage() ?? {
    setConfirmContent: () => {},
    ConfMessageEvent: {}
  };
  const { programScopes, rarities, damageTypes } = useGlobalVars();
  const { createAlert, getNewId } = useSystemAlerts();
  const navigate = useNavigate();

  const [displayInt, setDisplayInt] = useState(false);

  const idIncrement = useRef(0);
  const [damagesIds, setDamagesIds] = useState<number[]>([]);

  const [nPCs, setNPCs] = useState<ICuratedBasicNPC[]>([]);
  const calledApi = useRef(false);

  const [programData, setProgramData] = useState<ICuratedProgram | null>(null);

  const [programText, setProgramText] = useState('');
  const [programTextFr, setProgramTextFr] = useState('');

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const createDefaultData = useCallback((programData: ICuratedProgram | null) => {
    if (programData == null) {
      return {};
    }
    const { program, i18n } = programData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = program.title;
    defaultData.programScope = program.programScope;
    defaultData.uses = program.uses;
    defaultData.radius = program.radius;
    defaultData.ram = program.ram;
    defaultData.cost = program.cost;
    defaultData.rarity = program.rarity;
    defaultData.ai = program.ai?.nPC._id;
    defaultData.aiSummoned = program.aiSummoned;
    defaultData.starterKit = program.starterKit ?? 'never';
    if (i18n.fr !== undefined) {
      defaultData.nameFr = i18n.fr.title ?? '';
    }

    // Init Bonus Skill
    const damageIds: number[] = [];
    program.damages?.forEach((damage) => {
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
    defaultValues: useMemo(() => createDefaultData(programData), [createDefaultData, programData])
  });

  // TODO: Internationalization
  const programScopeList = useMemo(() => programScopes.map(({ programScope }) => ({
    value: programScope._id,
    label: programScope.title
  })), [programScopes]);

  const damageTypeList = useMemo(() => damageTypes.map(({ damageType }) => ({
    value: damageType._id,
    label: damageType.title
  })), [damageTypes]);

  const rarityList = useMemo(() => rarities.map(({ rarity }) => ({
    value: rarity._id,
    label: rarity.title
  })), [rarities]);

  const aiList = useMemo(() => nPCs
    .filter(({ nPC }) => nPC.virtual)
    .map(({ nPC }) => ({
      value: nPC._id,
      label: nPC.title
    })), [nPCs]);

  const starterKitList = useMemo(
    () =>
      possibleStarterKitValues.map(possibleStarterKitValue => ({
        value: possibleStarterKitValue,
        label: t(`terms.starterKit.${possibleStarterKitValue}`)
      })),
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

  const onSaveProgram: SubmitHandler<FormValues> = useCallback(
    ({
      name,
      nameFr,
      programScope,
      uses,
      radius,
      ram,
      cost,
      rarity,
      ai,
      aiSummoned,
      damages,
      starterKit
    }) => {
      if (
        introEditor === null
        || introFrEditor === null
        || api === undefined
        || programScope === undefined
        || ram === undefined
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
            summary: htmlFr
          }
        };
      }

      api.programs
        .update({
          id,
          title: name,
          programScope,
          ai,
          rarity,
          starterKit,
          cost: Number(cost),
          ram: Number(ram),
          summary: html,
          itemType: programData?.program.itemType,
          uses: uses !== undefined ? Number(uses) : undefined,
          radius: radius !== undefined ? Number(radius) : undefined,
          aiSummoned: aiSummoned !== undefined ? Number(aiSummoned) : undefined,
          i18n,
          damages: curatedDamages
        })
        .then(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditProgram.successUpdate', { ns: 'pages' })}</Ap>
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
    [
      introEditor,
      introFrEditor,
      api,
      id,
      programData?.program.itemType,
      setError,
      t,
      getNewId,
      createAlert
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || programData === null) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditProgram.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditProgram.confirmDeletion.text', {
          ns: 'pages',
          elt: programData.program.title
        }),
        confirmCta: t('adminEditProgram.confirmDeletion.confirmCta', { ns: 'pages' })
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.programs
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditProgram.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  )
                });
                void navigate(`/admin/programs`);
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
    programData,
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
      api.programs
        .get({ programId: id })
        .then((curatedProgram: ICuratedProgram) => {
          const { program, i18n } = curatedProgram;
          setProgramData(curatedProgram);
          setProgramText(program.summary);
          if (i18n.fr !== undefined) {
            setProgramTextFr(i18n.fr.summary ?? '');
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
      api.nPCs
        .getAllBasic()
        .then((curatedNPCs: ICuratedBasicNPC[]) => {
          setNPCs(curatedNPCs);
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
    reset(createDefaultData(programData));
  }, [programData, reset, createDefaultData]);

  return (
    <div
      className={classTrim(`
        adminEditProgram
        ${displayInt ? 'adminEditProgram--int-visible' : ''}
      `)}
    >
      <form className="adminEditProgram__content" onSubmit={handleSubmit(onSaveProgram)} noValidate>
        <div className="adminEditProgram__head">
          <Atitle className="adminEditProgram__head" level={1}>
            {programData?.program.title ?? ''}
          </Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditProgram.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Button className="adminEditProgram__return-btn" href="/admin/programs" size="small">
          {t('adminEditProgram.return', { ns: 'pages' })}
        </Button>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminEditProgram__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameProgram.required', { ns: 'fields' })
            }}
            label={t('nameProgram.label', { ns: 'fields' })}
            className="adminEditProgram__basics__name"
          />
          <div className="adminEditProgram__basics__class">
            <SmartSelect
              control={control}
              inputName="programScope"
              label={t('programScope.label', { ns: 'fields' })}
              rules={{ required: t('programScope.required', { ns: 'fields' }) }}
              options={programScopeList}
            />
            <Input
              control={control}
              inputName="ram"
              rules={{ required: t('ramProgram.required', { ns: 'fields' }) }}
              type="number"
              label={t('ramProgram.label', { ns: 'fields' })}
            />
            <Input
              control={control}
              inputName="radius"
              type="number"
              label={t('radiusProgram.label', { ns: 'fields' })}
            />
          </div>
        </div>
        <div className="adminEditProgram__details">
          <RichTextElement
            label={t('programTypeSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={programText}
            small
            complete
          />
          <div className="adminEditProgram__details__fields">
            <Input
              control={control}
              inputName="cost"
              type="number"
              rules={{
                required: t('programCost.required', { ns: 'fields' })
              }}
              label={t('programCost.label', { ns: 'fields' })}
              className="adminEditProgram__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="rarity"
              label={t('programRarity.label', { ns: 'fields' })}
              rules={{ required: t('programRarity.required', { ns: 'fields' }) }}
              options={rarityList}
              className="adminEditProgram__details__fields__elt"
            />
            <Input
              control={control}
              inputName="uses"
              type="number"
              label={t('usesProgram.label', { ns: 'fields' })}
            />
          </div>
          <div className="adminEditProgram__details__fields">
            <SmartSelect
              control={control}
              inputName="ai"
              label={t('aiProgram.label', { ns: 'fields' })}
              options={aiList}
              className="adminEditProgram__details__fields__elt"
            />
            <Input
              control={control}
              inputName="aiSummoned"
              type="number"
              label={t('aiSummonedProgram.label', { ns: 'fields' })}
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
        <Atitle className="adminEditProgram__bonus-title" level={2}>
          {t('adminEditProgram.values', { ns: 'pages' })}
        </Atitle>
        <div className="adminEditProgram__bonuses">
          <div className="adminEditProgram__bonuses__elts">
            {damagesIds.map(damagesId => (
              <div className="adminEditProgram__bonus" key={`damage-${damagesId}`}>
                <Atitle className="adminEditProgram__bonus__title" level={4}>
                  {t('adminEditProgram.damageTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditProgram__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`damages.damage-${damagesId}.damageType`}
                    rules={{
                      required: t('damagesType.required', { ns: 'fields' })
                    }}
                    label={t('damagesType.label', { ns: 'fields' })}
                    options={damageTypeList}
                    className="adminEditProgram__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`damages.damage-${damagesId}.dices`}
                    type="text"
                    rules={{
                      required: t('damagesValue.required', { ns: 'fields' })
                    }}
                    label={t('damagesValue.label', { ns: 'fields' })}
                    className="adminEditProgram__bonus__value"
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
                  className="adminEditProgram__bonus__button"
                />
              </div>
            ))}
          </div>
          <div className="adminEditProgram__bonuses__buttons">
            <Button onClick={onAddDamage}>
              {t('adminEditProgram.createDamageButton', { ns: 'pages' })}
            </Button>
          </div>
        </div>
        <div className="adminEditProgram__intl-title">
          <div className="adminEditProgram__intl-title__content">
            <Atitle className="adminEditProgram__intl-title__title" level={2}>
              {t('adminEditProgram.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditProgram__intl-title__info">
              {t('adminEditProgram.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt(prev => !prev);
            }}
            className="adminEditProgram__intl-title__btn"
          />
        </div>
        <div className="adminEditProgram__intl">
          <div className="adminEditProgram__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameProgram.label', { ns: 'fields' })} (FR)`}
              className="adminEditProgram__basics__name"
            />
          </div>
          <div className="adminEditProgram__details">
            <RichTextElement
              label={`${t('programSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent={programTextFr}
              small
              complete
            />
            <Input
              control={control}
              inputName="quoteFr"
              type="text"
              label={`${t('quoteProgram.label', { ns: 'fields' })} (FR)`}
              className="adminEditProgram__details__quote"
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditProgram.edit', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditProgram;
