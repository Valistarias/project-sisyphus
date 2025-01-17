import React, {
  useCallback, useEffect, useMemo, useRef, useState, type FC
} from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import {
  useForm, type SubmitHandler
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

import type { ErrorResponseType, ICuratedBasicNPC } from '../../../types';
import type { InternationalizationType } from '../../../types/global';

import { isThereDuplicate } from '../../../utils';

import './adminNewProgram.scss';

interface FormValues {
  name: string
  nameFr: string
  programScope: string
  starterKit: string
  uses?: number
  radius?: number
  ram: number
  cost: number
  rarity: string
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

const AdminNewProgram: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const {
    programScopes, rarities, itemTypes, damageTypes
  } = useGlobalVars();

  const [, setLoading] = useState(true);
  const [nPCs, setNPCs] = useState<ICuratedBasicNPC[]>([]);
  const calledApi = useRef(false);

  const idIncrement = useRef(0);
  const [damagesIds, setDamagesIds] = useState<number[]>([]);

  const introEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const introFrEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
    unregister
  } = useForm();

  // TODO: Internationalization
  const programScopeList = useMemo(
    () => programScopes.map(({ programScope }) => ({
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

  const getData = useCallback(() => {
    if (api !== undefined) {
      api.nPCs
        .getAllBasic()
        .then((curatedNPCs) => {
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
  }, [
    api,
    createAlert,
    getNewId,
    t
  ]);

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
      ) {
        return;
      }

      // Check duplicate on character param
      const sortedDamages = damages !== undefined ? Object.values(damages) : [];
      let duplicateDamages = false;
      if (sortedDamages.length > 0) {
        duplicateDamages = isThereDuplicate(
          sortedDamages.map(damage => damage.damageType)
        );
      }
      if (duplicateDamages) {
        setError('root.serverError', {
          type: 'duplicate',
          message: t('adminNewNode.errorDuplicateCharParam', { ns: 'pages' })
        });

        return;
      }

      const curatedDamages = sortedDamages.map(({
        damageType, dices
      }) => ({
        damageType,
        dices
      }));

      let html: string | null = introEditor.getHTML();
      const htmlFr = introFrEditor.getHTML();
      if (html === '<p class="ap"></p>') {
        html = null;
      }

      let i18n: InternationalizationType | null = null;

      if (nameFr !== '' || htmlFr !== '<p class="ap"></p>') {
        i18n = { fr: {
          title: nameFr,
          summary: htmlFr
        } };
      }

      api.programs
        .create({
          title: name,
          programScope,
          ai,
          rarity,
          starterKit,
          cost: Number(cost),
          ram: Number(ram),
          summary: html,
          itemType: itemTypes.find(itemType => itemType.name === 'pro')?._id ?? undefined,
          uses: uses !== undefined ? Number(uses) : undefined,
          radius: radius !== undefined ? Number(radius) : undefined,
          aiSummoned: aiSummoned !== undefined ? Number(aiSummoned) : undefined,
          i18n,
          damages: curatedDamages
        })
        .then((programType) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewProgram.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          void navigate(`/admin/program/${programType._id}`);
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          setError('root.serverError', {
            type: 'server',
            message: t(`serverErrors.${data.code}`, { field: i18next.format(t(`terms.charparamsType.${data.sent}`), 'capitalize') })
          });
        });
    },
    [
      introEditor,
      introFrEditor,
      itemTypes,
      api,
      getNewId,
      createAlert,
      t,
      navigate,
      setError
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
    getData,
    getNewId,
    t
  ]);

  return (
    <div className="adminNewProgram">
      <form className="adminNewProgram__content" onSubmit={() => handleSubmit(onSaveProgram)} noValidate>
        <Atitle level={1}>{t('adminNewProgram.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminNewProgram__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameProgram.required', { ns: 'fields' }) }}
            label={t('nameProgram.label', { ns: 'fields' })}
            className="adminNewProgram__basics__name"
          />
          <div className="adminNewProgram__basics__class">
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
        <div className="adminNewProgram__details">
          <RichTextElement
            label={t('programTypeSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
          <div className="adminNewProgram__details__fields">
            <Input
              control={control}
              inputName="cost"
              type="number"
              rules={{ required: t('programCost.required', { ns: 'fields' }) }}
              label={t('programCost.label', { ns: 'fields' })}
              className="adminNewProgram__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="rarity"
              label={t('programRarity.label', { ns: 'fields' })}
              rules={{ required: t('programRarity.required', { ns: 'fields' }) }}
              options={rarityList}
              className="adminNewProgram__details__fields__elt"
            />
            <Input
              control={control}
              inputName="uses"
              type="number"
              label={t('usesProgram.label', { ns: 'fields' })}
            />
          </div>
          <div className="adminNewProgram__details__fields">
            <SmartSelect
              control={control}
              inputName="ai"
              label={t('aiProgram.label', { ns: 'fields' })}
              options={aiList}
              className="adminNewProgram__details__fields__elt"
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
              className="adminNewProgram__details__fields__elt"
            />
          </div>
        </div>
        <Atitle className="adminNewProgram__bonus-title" level={2}>
          {t('adminNewProgram.values', { ns: 'pages' })}
        </Atitle>
        <div className="adminNewProgram__bonuses">
          <div className="adminNewProgram__bonuses__elts">
            {damagesIds.map(damagesId => (
              <div className="adminNewProgram__bonus" key={`damage-${damagesId}`}>
                <Atitle className="adminNewProgram__bonus__title" level={4}>
                  {t('adminNewProgram.damageTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewProgram__bonus__fields">
                  <SmartSelect
                    control={control}
                    inputName={`damages.damage-${damagesId}.damageType`}
                    rules={{ required: t('damagesType.required', { ns: 'fields' }) }}
                    label={t('damagesType.label', { ns: 'fields' })}
                    options={damageTypeList}
                    className="adminNewProgram__bonus__select"
                  />
                  <Input
                    control={control}
                    inputName={`damages.damage-${damagesId}.dices`}
                    type="text"
                    rules={{ required: t('damagesValue.required', { ns: 'fields' }) }}
                    label={t('damagesValue.label', { ns: 'fields' })}
                    className="adminNewProgram__bonus__value"
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
                  className="adminNewProgram__bonus__button"
                />
              </div>
            ))}
          </div>
          <div className="adminNewProgram__bonuses__buttons">
            <Button onClick={onAddDamage}>
              {t('adminNewProgram.createDamageButton', { ns: 'pages' })}
            </Button>
          </div>
        </div>
        <Atitle className="adminNewProgram__intl" level={2}>
          {t('adminNewProgram.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewProgram__intl-info">
          {t('adminNewProgram.i18nInfo', { ns: 'pages' })}
        </Ap>
        <div className="adminNewProgram__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameProgram.label', { ns: 'fields' })} (FR)`}
            className="adminNewProgram__basics__name"
          />
        </div>
        <div className="adminNewProgram__details">
          <RichTextElement
            label={`${t('programTypeSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent=""
            small
            complete
          />
          <Input
            control={control}
            inputName="quoteFr"
            type="text"
            label={`${t('quoteProgram.label', { ns: 'fields' })} (FR)`}
            className="adminNewProgram__details__quote"
          />
        </div>
        <Button type="submit">{t('adminNewProgram.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewProgram;
