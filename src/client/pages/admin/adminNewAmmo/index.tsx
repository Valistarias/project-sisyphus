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

import './adminNewAmmo.scss';
import type { ErrorResponseType } from '../../../types';
import type { InternationalizationType } from '../../../types/global';

interface FormValues {
  name: string;
  nameFr: string;
  weaponTypes: string[];
  offsetToHit?: number;
  offsetDamage?: number;
  cost: number;
  rarity: string;
  itemModifiers: string[];
}

const AdminNewAmmo: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { itemModifiers, itemTypes, weaponTypes, rarities } = useGlobalVars();

  const [, setLoading] = useState(true);
  const calledApi = useRef(false);

  const introEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const introFrEditor = useEditor({ extensions: completeRichTextElementExtentions });

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm();

  // TODO: Internationalization
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

  const weaponList = useMemo(
    () =>
      weaponTypes.map(({ weaponType }) => ({
        value: weaponType._id,
        label: weaponType.title,
      })),
    [weaponTypes]
  );

  const onSaveAmmo: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, rarity, cost, weaponTypes, itemModifiers, offsetToHit, offsetDamage }) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }

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
          },
        };
      }

      api.ammos
        .create({
          title: name,
          weaponTypes,
          rarity,
          offsetToHit,
          offsetDamage,
          itemType: itemTypes.find((itemType) => itemType.name === 'amo')?._id ?? undefined,
          cost: Number(cost),
          itemModifiers,
          summary: html,
          i18n,
        })
        .then((ammoType) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewAmmo.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          void navigate(`/admin/ammo/${ammoType._id}`);
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
    [introEditor, introFrEditor, api, itemTypes, getNewId, createAlert, t, navigate, setError]
  );

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      setLoading(true);
      calledApi.current = true;
    }
  }, [api, createAlert, getNewId, t]);

  return (
    <div className="adminNewAmmo">
      <form
        className="adminNewAmmo__content"
        onSubmit={(evt) => {
          void handleSubmit(onSaveAmmo)(evt);
        }}
        noValidate
      >
        <Atitle level={1}>{t('adminNewAmmo.title', { ns: 'pages' })}</Atitle>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewAmmo__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameAmmo.required', { ns: 'fields' }) }}
            label={t('nameAmmo.label', { ns: 'fields' })}
            className="adminNewAmmo__basics__name"
          />
          <div className="adminNewAmmo__basics__class">
            <Input
              control={control}
              inputName="offsetToHit"
              type="number"
              rules={{ required: t('ammoOffsetToHit.required', { ns: 'fields' }) }}
              label={t('ammoOffsetToHit.label', { ns: 'fields' })}
            />
            <Input
              control={control}
              inputName="offsetDamage"
              type="number"
              rules={{ required: t('ammoOffsetDamage.required', { ns: 'fields' }) }}
              label={t('ammoOffsetDamage.label', { ns: 'fields' })}
            />
            <SmartSelect
              control={control}
              isMulti
              inputName="weaponTypes"
              label={t('ammoWeaponTypes.label', { ns: 'fields' })}
              rules={{ required: t('ammoWeaponTypes.required', { ns: 'fields' }) }}
              options={weaponList}
              className="adminNewWeapon__details__fields__elt"
            />
          </div>
        </div>
        <div className="adminNewAmmo__details">
          <RichTextElement
            label={t('ammoSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
          <SmartSelect
            control={control}
            inputName="itemModifiers"
            label={t('ammoItemModifiers.label', { ns: 'fields' })}
            options={itemModifierList}
            isMulti
            className="adminNewAmmo__details__fields__elt"
          />
          <div className="adminNewAmmo__details__fields">
            <Input
              control={control}
              inputName="cost"
              type="number"
              rules={{ required: t('ammoCost.required', { ns: 'fields' }) }}
              label={t('ammoCost.label', { ns: 'fields' })}
              className="adminNewAmmo__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="rarity"
              label={t('ammoRarity.label', { ns: 'fields' })}
              rules={{ required: t('ammoRarity.required', { ns: 'fields' }) }}
              options={rarityList}
              className="adminNewAmmo__details__fields__elt"
            />
          </div>
        </div>
        <Atitle className="adminNewAmmo__intl" level={2}>
          {t('adminNewAmmo.i18n', { ns: 'pages' })}
        </Atitle>
        <Ap className="adminNewAmmo__intl-info">{t('adminNewAmmo.i18nInfo', { ns: 'pages' })}</Ap>
        <div className="adminNewAmmo__basics">
          <Input
            control={control}
            inputName="nameFr"
            type="text"
            label={`${t('nameAmmo.label', { ns: 'fields' })} (FR)`}
            className="adminNewAmmo__basics__name"
          />
        </div>
        <div className="adminNewAmmo__details">
          <RichTextElement
            label={`${t('ammoSummary.title', { ns: 'fields' })} (FR)`}
            editor={introFrEditor}
            rawStringContent=""
            small
            complete
          />
          <Input
            control={control}
            inputName="quoteFr"
            type="text"
            label={`${t('quoteAmmo.label', { ns: 'fields' })} (FR)`}
            className="adminNewAmmo__details__quote"
          />
        </div>
        <Button type="submit">{t('adminNewAmmo.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewAmmo;
