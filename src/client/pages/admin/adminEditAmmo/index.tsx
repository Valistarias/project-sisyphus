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
import { type ICuratedAmmo } from '../../../types';

import { classTrim } from '../../../utils';

import './adminEditAmmo.scss';

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

const AdminEditAmmo: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { id } = useParams();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage?.() ?? {
    setConfirmContent: () => {},
    ConfMessageEvent: {},
  };
  const { itemModifiers, weaponTypes, rarities } = useGlobalVars();
  const { createAlert, getNewId } = useSystemAlerts();
  const navigate = useNavigate();

  const [displayInt, setDisplayInt] = useState(false);

  const calledApi = useRef(false);

  const [ammoData, setAmmoData] = useState<ICuratedAmmo | null>(null);

  const [ammoText, setAmmoText] = useState('');
  const [ammoTextFr, setAmmoTextFr] = useState('');

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const createDefaultData = useCallback((ammoData: ICuratedAmmo | null) => {
    if (ammoData == null) {
      return {};
    }
    const { ammo, i18n } = ammoData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = ammo.title;
    defaultData.cost = ammo.cost;
    defaultData.rarity = ammo.rarity;
    defaultData.weaponTypes = ammo.weaponTypes;
    defaultData.itemModifiers = ammo.itemModifiers;
    defaultData.offsetToHit = ammo.offsetToHit;
    defaultData.offsetDamage = ammo.offsetDamage;
    if (i18n.fr !== undefined) {
      defaultData.nameFr = i18n.fr.title ?? '';
    }

    return defaultData;
  }, []);

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: useMemo(() => createDefaultData(ammoData), [createDefaultData, ammoData]),
  });

  // TODO: Internationalization
  const itemModifierList = useMemo(() => {
    return itemModifiers.map(({ itemModifier }) => ({
      value: itemModifier._id,
      label: itemModifier.title,
    }));
  }, [itemModifiers]);

  const rarityList = useMemo(() => {
    return rarities.map(({ rarity }) => ({
      value: rarity._id,
      label: rarity.title,
    }));
  }, [rarities]);

  const weaponList = useMemo(() => {
    return weaponTypes.map(({ weaponType }) => ({
      value: weaponType._id,
      label: weaponType.title,
    }));
  }, [weaponTypes]);

  const onSaveAmmo: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, rarity, cost, weaponTypes, itemModifiers, offsetToHit, offsetDamage }) => {
      if (
        introEditor === null ||
        introFrEditor === null ||
        api === undefined ||
        weaponTypes === undefined
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
        i18n = {
          fr: {
            title: nameFr,
            summary: htmlFr,
          },
        };
      }

      api.ammos
        .update({
          id,
          title: name,
          weaponTypes,
          rarity,
          offsetToHit,
          offsetDamage,
          itemType: ammoData?.ammo.itemType,
          cost: Number(cost),
          itemModifiers,
          summary: html,
          i18n,
        })
        .then(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditAmmo.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
        })
        .catch(({ response }) => {
          const { data } = response;
          setError('root.serverError', {
            type: 'server',
            message: t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`terms.charparamsType.${data.sent}`), 'capitalize'),
            }),
          });
        });
    },
    [
      introEditor,
      introFrEditor,
      api,
      id,
      ammoData?.ammo.itemType,
      getNewId,
      createAlert,
      t,
      setError,
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || ammoData === null) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditAmmo.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditAmmo.confirmDeletion.text', {
          ns: 'pages',
          elt: ammoData?.ammo.title,
        }),
        confirmCta: t('adminEditAmmo.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.ammos
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditAmmo.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                navigate(`/admin/ammos`);
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
    ammoData,
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
      api.ammos
        .get({ ammoId: id })
        .then((curatedAmmo: ICuratedAmmo) => {
          const { ammo, i18n } = curatedAmmo;
          setAmmoData(curatedAmmo);
          setAmmoText(ammo.summary);
          if (i18n.fr !== undefined) {
            setAmmoTextFr(i18n.fr.summary ?? '');
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
    reset(createDefaultData(ammoData));
  }, [ammoData, reset, createDefaultData]);

  return (
    <div
      className={classTrim(`
        adminEditAmmo
        ${displayInt ? 'adminEditAmmo--int-visible' : ''}
      `)}
    >
      <form className="adminEditAmmo__content" onSubmit={handleSubmit(onSaveAmmo)} noValidate>
        <div className="adminEditAmmo__head">
          <Atitle className="adminEditAmmo__head" rank={1}>
            {ammoData?.ammo.title ?? ''}
          </Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditAmmo.delete', { ns: 'pages' })}
          </Button>
        </div>
        {errors.root?.serverError?.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditAmmo__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameAmmo.required', { ns: 'fields' }),
            }}
            label={t('nameAmmo.label', { ns: 'fields' })}
            className="adminEditAmmo__basics__name"
          />
          <div className="adminEditAmmo__basics__class">
            <Input
              control={control}
              inputName="offsetToHit"
              type="number"
              rules={{
                required: t('ammoOffsetToHit.required', { ns: 'fields' }),
              }}
              label={t('ammoOffsetToHit.label', { ns: 'fields' })}
            />
            <Input
              control={control}
              inputName="offsetDamage"
              type="number"
              rules={{
                required: t('ammoOffsetDamage.required', { ns: 'fields' }),
              }}
              label={t('ammoOffsetDamage.label', { ns: 'fields' })}
            />
            <SmartSelect
              control={control}
              isMulti
              inputName="weaponTypes"
              label={t('ammoWeaponTypes.label', { ns: 'fields' })}
              rules={{
                required: t('ammoWeaponTypes.required', { ns: 'fields' }),
              }}
              options={weaponList}
              className="adminNewWeapon__details__fields__elt"
            />
          </div>
        </div>
        <div className="adminEditAmmo__details">
          <RichTextElement
            label={t('ammoTypeSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={ammoText}
            small
            complete
          />
          <SmartSelect
            control={control}
            inputName="itemModifiers"
            label={t('ammoItemModifiers.label', { ns: 'fields' })}
            options={itemModifierList}
            isMulti
            className="adminEditAmmo__details__fields__elt"
          />
          <div className="adminEditAmmo__details__fields">
            <Input
              control={control}
              inputName="cost"
              type="number"
              rules={{
                required: t('ammoCost.required', { ns: 'fields' }),
              }}
              label={t('ammoCost.label', { ns: 'fields' })}
              className="adminEditAmmo__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="rarity"
              label={t('ammoRarity.label', { ns: 'fields' })}
              rules={{ required: t('ammoRarity.required', { ns: 'fields' }) }}
              options={rarityList}
              className="adminEditAmmo__details__fields__elt"
            />
          </div>
        </div>
        <div className="adminEditAmmo__intl-title">
          <div className="adminEditAmmo__intl-title__content">
            <Atitle className="adminEditAmmo__intl-title__title" level={2}>
              {t('adminEditAmmo.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditAmmo__intl-title__info">
              {t('adminEditAmmo.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt((prev) => !prev);
            }}
            className="adminEditAmmo__intl-title__btn"
          />
        </div>
        <div className="adminEditAmmo__intl">
          <div className="adminEditAmmo__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameAmmo.label', { ns: 'fields' })} (FR)`}
              className="adminEditAmmo__basics__name"
            />
          </div>
          <div className="adminEditAmmo__details">
            <RichTextElement
              label={`${t('ammoSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent={ammoTextFr}
              small
              complete
            />
            <Input
              control={control}
              inputName="quoteFr"
              type="text"
              label={`${t('quoteAmmo.label', { ns: 'fields' })} (FR)`}
              className="adminEditAmmo__details__quote"
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditAmmo.edit', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditAmmo;
