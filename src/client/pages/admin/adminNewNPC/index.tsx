import React, { useCallback, useMemo, useRef, useState, type FC } from 'react';

import { useEditor } from '@tiptap/react';
import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input, SmartSelect } from '../../../molecules';
import { Alert, RichTextElement, completeRichTextElementExtentions } from '../../../organisms';

import { classTrim } from '../../../utils';

import './adminNewNPC.scss';

interface FormValues {
  name: string
  nameFr: string
  virtual: boolean
  speed: number
  flightSpeed?: number
  swimSpeed?: number
  hp: number
  pr?: number
  ar: number
  attacks?: Record<
    string,
    {
      title: string
      titleFr?: string
      summary: string
      summaryFr?: string
      damageType: string
      weaponScope: string
      dices: string
      bonusToHit?: number
    }
  >
}

const AdminNewNPC: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { damageTypes, weaponScopes } = useGlobalVars();

  const [displayInt, setDisplayInt] = useState(false);

  // General elements, for bonuses
  const damageTypeSelect = useMemo(
    () =>
      damageTypes.map(({ damageType }) => ({
        value: damageType._id,
        // TODO : Handle Internationalization
        label: damageType.title
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
        label: weaponScope.title
      })),
    [weaponScopes]
  );

  const introEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const introFrEditor = useEditor({
    extensions: completeRichTextElementExtentions
  });

  const {
    handleSubmit,
    setError,
    unregister,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: {
      icon: 'default'
    }
  });

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
        ({ title, titleFr, summary, summaryFr, damageType, weaponScope, dices, bonusToHit }) => ({
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
                    summary: summaryFr
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
            summary: htmlFr
          }
        };
      }

      api.nPCs
        .create({
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
          attacks: curatedAttacks
        })
        .then((quote) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewNPC.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          void navigate(`/admin/npc/${quote._id}`);
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.quoteType.${data.sent}`), 'capitalize')
              })
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.quoteType.${data.sent}`), 'capitalize')
              })
            });
          }
        });
    },
    [introEditor, introFrEditor, api, setError, t, getNewId, createAlert, navigate]
  );

  return (
    <div
      className={classTrim(`
        adminNewNPC
        ${displayInt ? 'adminNewNPC--int-visible' : ''}
      `)}
    >
      <form className="adminNewNPC__content" onSubmit={handleSubmit(onSaveNPC)} noValidate>
        <Atitle className="adminNewNPC__head" level={1}>
          {t('adminNewNPC.title', { ns: 'pages' })}
        </Atitle>
        {errors.root?.serverError.message !== undefined
          ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            )
          : null}
        <div className="adminNewNPC__basics">
          <Input
            control={control}
            inputName="name"
            type="text"
            rules={{
              required: t('nameNPC.required', { ns: 'fields' })
            }}
            label={t('nameNPC.label', { ns: 'fields' })}
            className="adminNewNPC__basics__name"
          />
          <div className="adminNewNPC__basics__class">
            <Input
              control={control}
              inputName="hp"
              type="number"
              label={t('hpNPC.label', { ns: 'fields' })}
              rules={{
                required: t('hpNPC.required', { ns: 'fields' })
              }}
              className="adminNewNPC__details__hp"
            />
            <Input
              control={control}
              inputName="ar"
              type="number"
              label={t('arNPC.label', { ns: 'fields' })}
              rules={{
                required: t('arNPC.required', { ns: 'fields' })
              }}
              className="adminNewNPC__details__ar"
            />
            <Input
              control={control}
              inputName="pr"
              type="number"
              label={t('prNPC.label', { ns: 'fields' })}
              className="adminNewNPC__details__pr"
            />
          </div>
        </div>
        <div className="adminNewNPC__details">
          <RichTextElement
            label={t('nPCSummary.title', { ns: 'fields' })}
            editor={introEditor}
            rawStringContent=""
            small
            complete
          />
          <div className="adminNewWeapon__details__fields">
            <Input
              control={control}
              inputName="speed"
              type="number"
              label={t('speedNPC.label', { ns: 'fields' })}
              rules={{
                required: t('speedNPC.required', { ns: 'fields' })
              }}
              className="adminNewNPC__details__speed"
            />
            <Input
              control={control}
              inputName="flightSpeed"
              type="number"
              label={t('flightSpeedNPC.label', { ns: 'fields' })}
              className="adminNewNPC__details__flightSpeed"
            />
            <Input
              control={control}
              inputName="swimSpeed"
              type="number"
              label={t('swimSpeedNPC.label', { ns: 'fields' })}
              className="adminNewNPC__details__swimSpeed"
            />
            <SmartSelect
              control={control}
              inputName="virtual"
              label={t('isVirtualNPC.label', { ns: 'fields' })}
              rules={{
                required: t('isVirtualNPC.required', { ns: 'fields' })
              }}
              options={boolRange}
              className="adminNewNPC__details__isVirtual"
            />
          </div>
        </div>
        <div className="adminNewNPC__bonuses">
          <div className="adminNewNPC__bonuses__elts">
            {attackIds.map(attackId => (
              <div className="adminNewNPC__bonus" key={`charParam-${attackId}`}>
                <Atitle className="adminNewNPC__bonus__title" level={4}>
                  {t('adminNewNPC.attackTitle', { ns: 'pages' })}
                </Atitle>
                <div className="adminNewNPC__bonus__fields adminNewNPC__bonus__fields--large">
                  <Input
                    control={control}
                    inputName={`attacks.attack-${attackId}.title`}
                    rules={{
                      required: t('attackTitle.required', { ns: 'fields' })
                    }}
                    label={t('attackTitle.label', { ns: 'fields' })}
                    className="adminNewNPC__bonus__value adminNewNPC__bonus__value--l"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`attacks.attack-${attackId}.damageType`}
                    rules={{
                      required: t('attackDamageType.required', { ns: 'fields' })
                    }}
                    label={t('attackDamageType.label', { ns: 'fields' })}
                    options={damageTypeSelect}
                    className="adminNewNPC__bonus__select adminNewNPC__bonus__value--s"
                  />
                  <SmartSelect
                    control={control}
                    inputName={`attacks.attack-${attackId}.weaponScope`}
                    rules={{
                      required: t('attackWeaponScope.required', { ns: 'fields' })
                    }}
                    label={t('attackWeaponScope.label', { ns: 'fields' })}
                    options={weaponScopeSelect}
                    className="adminNewNPC__bonus__select adminNewNPC__bonus__value--s"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`attacks.attack-${attackId}.summary`}
                    rules={{
                      required: t('attackSummary.required', { ns: 'fields' })
                    }}
                    label={t('attackSummary.label', { ns: 'fields' })}
                    className="adminNewNPC__bonus__value adminNewNPC__bonus__value--l"
                  />
                  <Input
                    control={control}
                    inputName={`attacks.attack-${attackId}.dices`}
                    label={t('attackDices.label', { ns: 'fields' })}
                    rules={{
                      required: t('attackDices.required', { ns: 'fields' })
                    }}
                    className="adminNewNPC__bonus__value adminNewNPC__bonus__value--s"
                  />
                  <Input
                    control={control}
                    inputName={`attacks.attack-${attackId}.bonusToHit`}
                    label={t('attackBonusToHit.label', { ns: 'fields' })}
                    className="adminNewNPC__bonus__value adminNewNPC__bonus__value--s"
                  />
                  <Atitle className="adminNewNPC__bonus__title" level={4}>
                    {t('adminNewNPC.attackInt', { ns: 'pages' })}
                  </Atitle>
                  <Input
                    control={control}
                    inputName={`attacks.attack-${attackId}.titleFr`}
                    label={`${t('attackTitle.label', { ns: 'fields' })} (FR)`}
                    className="adminNewNPC__bonus__value adminNewNPC__bonus__value--l"
                  />
                  <Input
                    control={control}
                    type="textarea"
                    inputName={`attacks.attack-${attackId}.summaryFr`}
                    label={`${t('attackSummary.label', { ns: 'fields' })} (FR)`}
                    className="adminNewNPC__bonus__value adminNewNPC__bonus__value--l"
                  />
                </div>
                <Button
                  icon="Delete"
                  theme="afterglow"
                  onClick={() => {
                    setAttackIds(prev =>
                      prev.reduce((result: number[], elt) => {
                        if (elt !== attackId) {
                          result.push(elt);
                        }

                        return result;
                      }, [])
                    );
                    unregister(`attacks.attack-${attackId}`);
                  }}
                  className="adminNewNPC__bonus__button"
                />
              </div>
            ))}
          </div>
          <div className="adminNewNPC__bonuses__buttons">
            <Button onClick={onAddAttack}>
              {t('adminNewNPC.createAttackButton', { ns: 'pages' })}
            </Button>
          </div>
        </div>
        <div className="adminNewNPC__intl-title">
          <div className="adminNewNPC__intl-title__content">
            <Atitle className="adminNewNPC__intl-title__title" level={2}>
              {t('adminNewNPC.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminNewNPC__intl-title__info">
              {t('adminNewNPC.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt(prev => !prev);
            }}
            className="adminNewNPC__intl-title__btn"
          />
        </div>
        <div className="adminNewNPC__intl">
          <div className="adminNewNPC__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameNPC.label', { ns: 'fields' })} (FR)`}
              className="adminNewNPC__basics__name"
            />
          </div>
          <div className="adminNewNPC__details">
            <RichTextElement
              label={`${t('nPCSummary.title', { ns: 'fields' })} (FR)`}
              editor={introFrEditor}
              rawStringContent=""
              small
              complete
            />
            <Input
              control={control}
              inputName="quoteFr"
              type="text"
              label={`${t('quoteNPC.label', { ns: 'fields' })} (FR)`}
              className="adminNewNPC__details__quote"
            />
          </div>
        </div>
        <Button type="submit">{t('adminNewNPC.createButton', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewNPC;
