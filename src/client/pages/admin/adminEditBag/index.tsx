import React, {
  useCallback, useEffect, useMemo, useRef, useState, type FC
} from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import {
  useForm, type SubmitHandler
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

import type { ConfirmMessageDetailData } from '../../../providers/confirmMessage';
import type { ErrorResponseType, ICuratedBag } from '../../../types';
import type { InternationalizationType } from '../../../types/global';

import { classTrim } from '../../../utils';

import './adminEditBag.scss';

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

const AdminEditBag: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { id } = useParams();
  const {
    setConfirmContent,
    removeConfirmEventListener,
    addConfirmEventListener
  } = useConfirmMessage();
  const {
    itemModifiers, itemTypes, rarities
  } = useGlobalVars();
  const {
    createAlert, getNewId
  } = useSystemAlerts();
  const navigate = useNavigate();

  const [displayInt, setDisplayInt] = useState(false);

  const calledApi = useRef(false);

  const [bagData, setBagData] = useState<ICuratedBag | null>(null);

  const [bagText, setBagText] = useState('');
  const [bagTextFr, setBagTextFr] = useState('');

  const introEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const introFrEditor = useEditor(
    { extensions: completeRichTextElementExtentions }
  );

  const createDefaultData = useCallback((bagData: ICuratedBag | null) => {
    if (bagData == null) {
      return {};
    }
    const {
      bag, i18n
    } = bagData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = bag.title;
    defaultData.cost = bag.cost;
    defaultData.rarity = bag.rarity;
    defaultData.size = bag.size;
    defaultData.itemModifiers = bag.itemModifiers;
    defaultData.storableItemTypes = bag.storableItemTypes;
    defaultData.starterKit = bag.starterKit ?? 'never';
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
    reset
  } = useForm({ defaultValues: useMemo(
    () => createDefaultData(bagData), [createDefaultData, bagData]
  ) });

  // TODO: Internationalization
  const itemModifierList = useMemo(
    () => itemModifiers.map(({ itemModifier }) => ({
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
      name,
      nameFr,
      rarity,
      cost,
      storableItemTypes,
      size,
      itemModifiers,
      starterKit
    }) => {
      if (
        introEditor === null
        || introFrEditor === null
        || api === undefined
      ) {
        return;
      }

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

      api.bags
        .update({
          id,
          title: name,
          storableItemTypes,
          rarity,
          starterKit,
          size,
          itemType: bagData?.bag.itemType,
          cost: Number(cost),
          itemModifiers,
          summary: html,
          i18n
        })
        .then(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditBag.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
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
      api,
      id,
      bagData?.bag.itemType,
      getNewId,
      createAlert,
      t,
      setError
    ]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || bagData === null) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditBag.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditBag.confirmDeletion.text', {
          ns: 'pages',
          elt: bagData.bag.title
        }),
        confirmCta: t('adminEditBag.confirmDeletion.confirmCta', { ns: 'pages' })
      },
      (evtId: string) => {
        const confirmDelete = (
          { detail }: { detail: ConfirmMessageDetailData }
        ): void => {
          if (detail.proceed) {
            api.bags
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditBag.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  )
                });
                void navigate(`/admin/bags`);
              })
              .catch(({ response }: ErrorResponseType) => {
                const { data } = response;
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
          removeConfirmEventListener(evtId, confirmDelete);
        };
        addConfirmEventListener(evtId, confirmDelete);
      }
    );
  }, [
    api,
    bagData,
    setConfirmContent,
    t,
    addConfirmEventListener,
    removeConfirmEventListener,
    id,
    getNewId,
    createAlert,
    navigate,
    setError
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.bags
        .get({ bagId: id })
        .then((curatedBag) => {
          const {
            bag, i18n
          } = curatedBag;
          setBagData(curatedBag);
          setBagText(bag.summary);
          if (i18n.fr !== undefined) {
            setBagTextFr(i18n.fr.summary ?? '');
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
    reset(createDefaultData(bagData));
  }, [
    bagData,
    reset,
    createDefaultData
  ]);

  return (
    <div
      className={classTrim(`
        adminEditBag
        ${displayInt ? 'adminEditBag--int-visible' : ''}
      `)}
    >
      <form className="adminEditBag__content" onSubmit={() => handleSubmit(onSaveBag)} noValidate>
        <div className="adminEditBag__head">
          <Atitle className="adminEditBag__head" level={1}>
            {bagData?.bag.title ?? ''}
          </Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditBag.delete', { ns: 'pages' })}
          </Button>
        </div>
        <Button className="adminEditBag__return-btn" href="/admin/bags" size="small">
          {t('adminEditBag.return', { ns: 'pages' })}
        </Button>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminEditBag__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{ required: t('nameBag.required', { ns: 'fields' }) }}
            label={t('nameBag.label', { ns: 'fields' })}
            className="adminEditBag__basics__name"
          />
          <div className="adminEditBag__basics__class">
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
              className="adminEditWeapon__details__fields__elt"
            />
          </div>
        </div>
        <div className="adminEditBag__details">
          <RichTextElement
            label={t('bagTypeSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={bagText}
            small
            complete
          />
          <SmartSelect
            control={control}
            inputName="itemModifiers"
            label={t('bagItemModifiers.label', { ns: 'fields' })}
            options={itemModifierList}
            isMulti
            className="adminEditBag__details__fields__elt"
          />
          <div className="adminEditBag__details__fields">
            <Input
              control={control}
              inputName="cost"
              type="number"
              rules={{ required: t('bagCost.required', { ns: 'fields' }) }}
              label={t('bagCost.label', { ns: 'fields' })}
              className="adminEditBag__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="rarity"
              label={t('bagRarity.label', { ns: 'fields' })}
              rules={{ required: t('bagRarity.required', { ns: 'fields' }) }}
              options={rarityList}
              className="adminEditBag__details__fields__elt"
            />
            <SmartSelect
              control={control}
              inputName="starterKit"
              label={t('programStarterKit.label', { ns: 'fields' })}
              options={starterKitList}
              className="adminEditBag__details__fields__elt"
            />
          </div>
        </div>
        <div className="adminEditBag__intl-title">
          <div className="adminEditBag__intl-title__content">
            <Atitle className="adminEditBag__intl-title__title" level={2}>
              {t('adminEditBag.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditBag__intl-title__info">
              {t('adminEditBag.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt(prev => !prev);
            }}
            className="adminEditBag__intl-title__btn"
          />
        </div>
        <div className="adminEditBag__intl">
          <div className="adminEditBag__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameBag.label', { ns: 'fields' })} (FR)`}
              className="adminEditBag__basics__name"
            />
          </div>
          <div className="adminEditBag__details">
            <RichTextElement
              label={`${t('bagSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent={bagTextFr}
              small
              complete
            />
            <Input
              control={control}
              inputName="quoteFr"
              type="text"
              label={`${t('quoteBag.label', { ns: 'fields' })} (FR)`}
              className="adminEditBag__details__quote"
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditBag.edit', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditBag;
