import React, {
  useCallback, useEffect, useMemo, useRef, useState, type FC
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

import './adminNewBag.scss';

interface FormValues {
  name: string
  nameFr: string
  storableItemTypes: string[]
  size: number
  cost: number
  rarity: string
  starterKit: string
  itemModifiers: string[]
}

const AdminNewBag: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const {
    itemModifiers, itemTypes, rarities
  } = useGlobalVars();

  const [, setLoading] = useState(true);
  const calledApi = useRef(false);

  const introEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const introFrEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors }
  } = useForm();

  // TODO: Internationalization
  const itemModifierList = useMemo(() => itemModifiers.map(({ itemModifier }) => ({
    value: itemModifier._id,
    label: itemModifier.title
  })), [itemModifiers]);

  const rarityList = useMemo(() => rarities.map(({ rarity }) => ({
    value: rarity._id,
    label: rarity.title
  })), [rarities]);

  const itemTypeList = useMemo(
    () =>
      itemTypes.map(itemType => ({
        value: itemType._id,
        label: t(`itemTypeNames.${itemType.name}`)
      })),
    [itemTypes, t]
  );

  const starterKitList = useMemo(
    () =>
      possibleStarterKitValues.map(possibleStarterKitValue => ({
        value: possibleStarterKitValue,
        label: t(`terms.starterKit.${possibleStarterKitValue}`)
      })),
    [t]
  );

  const onSaveBag: SubmitHandler<FormValues> = useCallback(
    ({
      name, nameFr, rarity, cost, storableItemTypes, itemModifiers, size, starterKit
    }) => {
      if (
        introEditor === null
        || introFrEditor === null
        || api === undefined
        || storableItemTypes === undefined
        || size === undefined
      ) {
        return;
      }

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

      api.bags
        .create({
          title: name,
          storableItemTypes,
          rarity,
          starterKit,
          size,
          itemType: itemTypes.find(itemType => itemType.name === 'bag')?._id ?? undefined,
          cost: Number(cost),
          itemModifiers,
          summary: html,
          i18n
        })
        .then((bagType) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewBag.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          void navigate(`/admin/bag/${bagType._id}`);
        })
        .catch(({ response }) => {
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
      api,
      itemTypes,
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
    }
  }, [
    api,
    createAlert,
    getNewId,
    t
  ]);

  return (
    <div className="adminNewBag">
      <form className="adminNewBag__content" onSubmit={handleSubmit(onSaveBag)} noValidate>
        <Atitle level={1}>{t('adminNewBag.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminNewBag__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameBag.required', { ns: 'fields' }) }}
            label={t('nameBag.label', { ns: 'fields' })}
            className="adminNewBag__basics__name"
          />
          <div className="adminNewBag__basics__class">
            <Input
              control={control}
              inputName="size"
              type="number"
              rules={{ required: t('bagSize.required', { ns: 'fields' }) }}
              label={t('bagSize.label', { ns: 'fields' })}
            />
            <SmartSelect
              control={control}
              isMulti
              inputName="storableItemTypes"
              label={t('bagStorableItemTypes.label', { ns: 'fields' })}
              rules={{ required: t('bagStorableItemTypes.required', { ns: 'fields' }) }}
              options={itemTypeList}
              className="adminNewWeapon__details__fields__elt"
            />
          </div>
        </div>
        <div className="adminNewBag__details">
          <RichTextElement
            label={t('bagTypeSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
          <SmartSelect
            control={control}
            inputName="itemModifiers"
            label={t('bagItemModifiers.label', { ns: 'fields' })}
            options={itemModifierList}
            isMulti
            className="adminNewBag__details__fields__elt"
          />
          <div className="adminNewBag__details__fields">
            <Input
              control={control}
              inputName="cost"
              type="number"
              rules={{ required: t('bagCost.required', { ns: 'fields' }) }}
              label={t('bagCost.label', { ns: 'fields' })}
              className="adminNewBag__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="rarity"
              label={t('bagRarity.label', { ns: 'fields' })}
              rules={{ required: t('bagRarity.required', { ns: 'fields' }) }}
              options={rarityList}
              className="adminNewBag__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="starterKit"
              label={t('bagStarterKit.label', { ns: 'fields' })}
              options={starterKitList}
              className="adminNewBag__details__fields__elt"
            />
          </div>
        </div>
        <Atitle className="adminNewBag__intl" level={2}>
          {t('adminNewBag.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewBag__intl-info">{t('adminNewBag.i18nInfo', { ns: 'pages' })}</Ap>
        <div className="adminNewBag__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameBag.label', { ns: 'fields' })} (FR)`}
            className="adminNewBag__basics__name"
          />
        </div>
        <div className="adminNewBag__details">
          <RichTextElement
            label={`${t('bagTypeSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent=""
            small
            complete
          />
          <Input
            control={control}
            inputName="quoteFr"
            type="text"
            label={`${t('quoteBag.label', { ns: 'fields' })} (FR)`}
            className="adminNewBag__details__quote"
          />
        </div>
        <Button type="submit">{t('adminNewBag.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewBag;
