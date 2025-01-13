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

import type { ICuratedNPC } from '../../../types';

import { classTrim } from '../../../utils';

import './adminEditNPC.scss';

interface FormValues {
  id: string;
  name: string;
  nameFr: string;
  virtual: string;
  speed: number;
  flightSpeed?: number;
  swimSpeed?: number;
  hp: number;
  pr?: number;
  ar: number;
  attacks?: Record<
    string,
    {
      id: string;
      title: string;
      titleFr?: string;
      summary: string;
      summaryFr?: string;
      damageType: string;
      weaponScope: string;
      dices: string;
      bonusToHit?: number;
    }
  >;
}

const AdminEditNPC: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { id } = useParams();
  const { setConfirmContent, ConfMessageEvent } = useConfirmMessage() ?? {
    setConfirmContent: () => {},
    ConfMessageEvent: {},
  };
  const { damageTypes, weaponScopes } = useGlobalVars();
  const { createAlert, getNewId } = useSystemAlerts();
  const navigate = useNavigate();

  const [displayInt, setDisplayInt] = useState(false);

  // General elements, for bonuses
  const damageTypeSelect = useMemo(
    () =>
      damageTypes.map(({ damageType }) => ({
        value: damageType._id,
        // TODO : Handle Internationalization
        label: damageType.title,
      })),
    [damageTypes]
  );
  const [attackIds, setAttackIds] = useState<number[]>([]);
  const idIncrement = useRef(0);

  const weaponScopeSelect = useMemo(
    () =>
      weaponScopes.map(({ weaponScope }) => ({
        value: weaponScope._id,
        // TODO : Handle Internationalization
        label: weaponScope.title,
      })),
    [weaponScopes]
  );

  const calledApi = useRef(false);
  const [nPCData, setNPCData] = useState<ICuratedNPC | null>(null);

  const [nPCText, setNPCText] = useState('');
  const [nPCTextFr, setNPCTextFr] = useState('');

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions,
  });

  const createDefaultData = useCallback((nPCData: ICuratedNPC | null) => {
    if (nPCData == null) {
      return {};
    }
    const { nPC, i18n } = nPCData;
    const defaultData: Partial<FormValues> = {};
    defaultData.name = nPC.title;
    defaultData.virtual = nPC.virtual ? '1' : '0';
    defaultData.speed = nPC.speed;
    defaultData.flightSpeed = nPC.flightSpeed;
    defaultData.swimSpeed = nPC.swimSpeed;
    defaultData.hp = nPC.hp;
    defaultData.pr = nPC.pr;
    defaultData.ar = nPC.ar;
    if (i18n.fr !== undefined) {
      defaultData.nameFr = i18n.fr.title ?? '';
    }
    // Init Attacks
    const tempAttackId: number[] = [];
    nPC.attacks.forEach((attack) => {
      if (defaultData.attacks === undefined) {
        defaultData.attacks = {};
      }
      defaultData.attacks[`attack-${idIncrement.current}`] = {
        id: attack._id,
        title: attack.title,
        damageType: attack.damageType,
        weaponScope: attack.weaponScope,
        dices: attack.dices,
        bonusToHit: attack.bonusToHit,
        summary: attack.summary,
        titleFr: attack.i18n.fr.title,
        summaryFr: attack.i18n.fr.summary,
      };

      tempAttackId.push(idIncrement.current);
      idIncrement.current += 1;
    });
    setAttackIds(tempAttackId);

    return defaultData;
  }, []);

  const {
    handleSubmit,
    setError,
    unregister,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: useMemo(() => createDefaultData(nPCData), [createDefaultData, nPCData]),
  });

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

  const onAddAttack = useCallback(() => {
    setAttackIds((prev) => {
      const next = [...prev];
      next.push(idIncrement.current);
      idIncrement.current += 1;
      return next;
    });
  }, []);

  const onSaveNPC: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr, virtual, speed, flightSpeed, swimSpeed, hp, pr, ar, attacks }) => {
      if (introEditor === null || introFrEditor === null || api === undefined) {
        return;
      }

      const attacksArr = attacks !== undefined ? Object.values(attacks) : [];

      const curatedAttacks = attacksArr.map(
        ({
          id,
          title,
          titleFr,
          summary,
          summaryFr,
          damageType,
          weaponScope,
          dices,
          bonusToHit,
        }) => ({
          ...(id !== undefined ? { id } : {}),
          title,
          summary,
          damageType,
          weaponScope,
          dices,
          bonusToHit,
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

      api.nPCs
        .update({
          id,
          title: name,
          summary: html,
          i18n,
          virtual: String(virtual) === '1',
          speed: Number(speed),
          flightSpeed: flightSpeed !== undefined ? Number(flightSpeed) : undefined,
          swimSpeed: swimSpeed !== undefined ? Number(swimSpeed) : undefined,
          hp: Number(hp),
          pr: pr !== undefined ? Number(pr) : undefined,
          ar: Number(ar),
          attacks: curatedAttacks,
        })
        .then((quote) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditNPC.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.quoteType.${data.sent}`), 'capitalize'),
              }),
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.quoteType.${data.sent}`), 'capitalize'),
              }),
            });
          }
        });
    },
    [introEditor, introFrEditor, api, id, getNewId, createAlert, t, setError]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || nPCData === null) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditNPC.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditNPC.confirmDeletion.text', {
          ns: 'pages',
          elt: nPCData.nPC.title,
        }),
        confirmCta: t('adminEditNPC.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }): void => {
          if (detail.proceed === true) {
            api.nPCs
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditNPC.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                void navigate('/admin/npcs');
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
    nPCData,
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
      api.nPCs
        .get({ nPCId: id })
        .then((curatedNPC: ICuratedNPC) => {
          const { nPC, i18n } = curatedNPC;
          setNPCData(curatedNPC);
          setNPCText(nPC.summary);
          if (i18n.fr !== undefined) {
            setNPCTextFr(i18n.fr.summary ?? '');
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
    reset(createDefaultData(nPCData));
  }, [nPCData, reset, createDefaultData]);

  return (
    <div
      className={classTrim(`
        adminEditNPC
        ${displayInt ? 'adminEditNPC--int-visible' : ''}
      `)}
    >
      <form className="adminEditNPC__content" onSubmit={handleSubmit(onSaveNPC)} noValidate>
        <div className="adminEditNPC__head">
          <Atitle className="adminEditNPC__head" level={1}>
            {t('adminEditNPC.title', { ns: 'pages' })}
          </Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditNPC.delete', { ns: 'pages' })}
          </Button>
        </div>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditNPC__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameNPC.required', { ns: 'fields' }),
            }}
            label={t('nameNPC.label', { ns: 'fields' })}
            className="adminEditNPC__basics__name"
          />
          <div className="adminEditNPC__basics__class">
            <Input
              control={control}
              inputName="hp"
              type="number"
              label={t('hpNPC.label', { ns: 'fields' })}
              rules={{
                required: t('hpNPC.required', { ns: 'fields' }),
              }}
              className="adminEditNPC__details__hp"
            />
            <Input
              control={control}
              inputName="ar"
              type="number"
              label={t('arNPC.label', { ns: 'fields' })}
              rules={{
                required: t('arNPC.required', { ns: 'fields' }),
              }}
              className="adminEditNPC__details__ar"
            />
            <Input
              control={control}
              inputName="pr"
              type="number"
              label={t('prNPC.label', { ns: 'fields' })}
              className="adminEditNPC__details__pr"
            />
          </div>
        </div>
        <div className="adminEditNPC__details">
          <RichTextElement
            label={t('nPCSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent={nPCText}
            small
            complete
          />
          <div className="adminEditWeapon__details__fields">
            <Input
              control={control}
              inputName="speed"
              type="number"
              label={t('speedNPC.label', { ns: 'fields' })}
              rules={{
                required: t('speedNPC.required', { ns: 'fields' }),
              }}
              className="adminEditNPC__details__speed"
            />
            <Input
              control={control}
              inputName="flightSpeed"
              type="number"
              label={t('flightSpeedNPC.label', { ns: 'fields' })}
              className="adminEditNPC__details__flightSpeed"
            />
            <Input
              control={control}
              inputName="swimSpeed"
              type="number"
              label={t('swimSpeedNPC.label', { ns: 'fields' })}
              className="adminEditNPC__details__swimSpeed"
            />
            <SmartSelect
              control={control}
              inputName="virtual"
              label={t('isVirtualNPC.label', { ns: 'fields' })}
              rules={{
                required: t('isVirtualNPC.required', { ns: 'fields' }),
              }}
              options={boolRange}
              className="adminEditNPC__details__isVirtual"
            />
          </div>
        </div>
        <div className="adminEditNPC__bonuses">
          <div className="adminEditNPC__bonuses__elts">
            {attackIds.map((attackId) => (
              <div className="adminEditNPC__bonus" key={`charParam-${attackId}`}>
                <Atitle className="adminEditNPC__bonus__title" level={4}>
                  {t('adminEditNPC.attackTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminEditNPC__bonus__fields adminEditNPC__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`attacks.attack-${attackId}.title`}
                    rules={{
                      required: t('attackTitle.required', { ns: 'fields' }),
                    }}
                    label={t('attackTitle.label', { ns: 'fields' })}
                    className="adminEditNPC__bonus__value adminEditNPC__bonus__value--l"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`attacks.attack-${attackId}.damageType`}
                    rules={{
                      required: t('attackDamageType.required', { ns: 'fields' }),
                    }}
                    label={t('attackDamageType.label', { ns: 'fields' })}
                    options={damageTypeSelect}
                    className="adminEditNPC__bonus__select adminEditNPC__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`attacks.attack-${attackId}.weaponScope`}
                    rules={{
                      required: t('attackWeaponScope.required', { ns: 'fields' }),
                    }}
                    label={t('attackWeaponScope.label', { ns: 'fields' })}
                    options={weaponScopeSelect}
                    className="adminEditNPC__bonus__select adminEditNPC__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`attacks.attack-${attackId}.summary`}
                    rules={{
                      required: t('attackSummary.required', { ns: 'fields' }),
                    }}
                    label={t('attackSummary.label', { ns: 'fields' })}
                    className="adminEditNPC__bonus__value adminEditNPC__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`attacks.attack-${attackId}.dices`}
                    label={t('attackDices.label', { ns: 'fields' })}
                    rules={{
                      required: t('attackDices.required', { ns: 'fields' }),
                    }}
                    className="adminEditNPC__bonus__value adminEditNPC__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`attacks.attack-${attackId}.bonusToHit`}
                    label={t('attackBonusToHit.label', { ns: 'fields' })}
                    className="adminEditNPC__bonus__value adminEditNPC__bonus__value--s"
                  />
                  <Atitle className="adminEditNPC__bonus__title" level={4}>
                    {t('adminEditNPC.attackInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`attacks.attack-${attackId}.titleFr`}
                    label={`${t('attackTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminEditNPC__bonus__value adminEditNPC__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`attacks.attack-${attackId}.summaryFr`}
                    label={`${t('attackSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminEditNPC__bonus__value adminEditNPC__bonus__value--l"
                  />
                </div>
                <Button
                  icon="Delete"
                  theme="afterglow"
                  onClick={() => {
                    setAttackIds((prev) =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== attackId) {
                          result.push(elt);
                        }
                        return result;
                      }, [])
                    );
                    unregister(`attacks.attack-${attackId}`);
                  }}
                  className="adminEditNPC__bonus__button"
                />
              </div>
            ))}
          </div>
          <div className="adminEditNPC__bonuses__buttons">
            <Button onClick={onAddAttack}>
              {t('adminEditNPC.createAttackButton', { ns: 'pages' })}
            </Button>
          </div>
        </div>
        <div className="adminEditNPC__intl-title">
          <div className="adminEditNPC__intl-title__content">
            <Atitle className="adminEditNPC__intl-title__title" level={2}>
              {t('adminEditNPC.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminEditNPC__intl-title__info">
              {t('adminEditNPC.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt((prev) => !prev);
            }}
            className="adminEditNPC__intl-title__btn"
          />
        </div>
        <div className="adminEditNPC__intl">
          <div className="adminEditNPC__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameNPC.label', { ns: 'fields' })} (FR)`}
              className="adminEditNPC__basics__name"
            />
          </div>
          <div className="adminEditNPC__details">
            <RichTextElement
              label={`${t('nPCSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent={nPCTextFr}
              small
              complete
            />
            <Input
              control={control}
              inputName="quoteFr"
              type="text"
              label={`${t('quoteNPC.label', { ns: 'fields' })} (FR)`}
              className="adminEditNPC__details__quote"
            />
          </div>
        </div>
        <Button type="submit">{t('adminEditNPC.updateButton', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditNPC;
