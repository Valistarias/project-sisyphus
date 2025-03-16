import React, { useCallback, useMemo, type FC } from 'react';

import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input, LinkButton, SmartSelect } from '../../../molecules';
import { Alert } from '../../../organisms';

import type { ErrorResponseType } from '../../../types/global';

import { classTrim } from '../../../utils';

import './adminNewBasicAction.scss';

interface FormValues {
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

const AdminNewBasicAction: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { actionTypes, actionDurations, skills, reloadBasicActions } = useGlobalVars();

  // General elements, for bonuses
  const skillSelect = useMemo(
    () =>
      skills.map(({ skill }) => ({
        value: skill._id,
        // TODO : Handle Internationalization
        label: skill.title,
      })),
    [skills]
  );

  const actionTypeSelect = useMemo(
    () =>
      actionTypes.map(({ name, _id }) => ({
        value: _id,
        label: t(`terms.actionType.${name}`),
      })),
    [actionTypes, t]
  );

  const actionDurationSelect = useMemo(
    () =>
      actionDurations.map(({ name, _id }) => ({
        value: _id,
        label: t(`terms.actionDuration.${name}`),
      })),
    [actionDurations, t]
  );

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: {} });

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

  const onSaveBasicAction: SubmitHandler<FormValues> = useCallback(
    ({
      title,
      titleFr,
      summary,
      summaryFr,
      type,
      skill,
      duration,
      time,
      timeFr,
      damages,
      offsetSkill,
      uses,
      isKarmic,
      karmicCost,
    }) => {
      if (api === undefined) {
        return;
      }

      api.actions
        .create({
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
          isBasic: true,
        })
        .then((action) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewBasicAction.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadBasicActions();
          void navigate(`/admin/basicaction/${action._id}`);
        })
        .catch(({ response }: ErrorResponseType) => {
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
    [api, getNewId, createAlert, t, reloadBasicActions, navigate, setError]
  );

  return (
    <div
      className={classTrim(`
        adminNewBasicAction
      `)}
    >
      <form
        className="adminNewBasicAction__content"
        onSubmit={(evt) => {
          void handleSubmit(onSaveBasicAction)(evt);
        }}
        noValidate
      >
        <Atitle className="adminNewBasicAction__head" level={1}>
          {t('adminNewBasicAction.title', { ns: 'pages' })}
        </Atitle>
        <LinkButton className="adminEditBag__return-btn" href="/admin/basicactions" size="small">
          {t('adminNewBasicAction.return', { ns: 'pages' })}
        </LinkButton>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewBasicAction__bonus">
          <Atitle className="adminNewBasicAction__bonus__title" level={4}>
            {t('adminNewBasicAction.actionTitle', { ns: 'pages' })}
          </Atitle>
          <div className="adminNewBasicAction__bonus__fields adminNewBasicAction__bonus__fields--large">
            <Input
              control={control}
              inputName="title"
              rules={{ required: t('actionTitle.required', { ns: 'fields' }) }}
              label={t('actionTitle.label', { ns: 'fields' })}
              className="adminNewBasicAction__bonus__value adminNewBasicAction__bonus__value--l"
            />
            <SmartSelect
              control={control}
              inputName="type"
              rules={{ required: t('actionType.required', { ns: 'fields' }) }}
              label={t('actionType.label', { ns: 'fields' })}
              options={actionTypeSelect}
              className="adminNewBasicAction__bonus__select adminNewBasicAction__bonus__value--s"
            />
            <SmartSelect
              control={control}
              inputName="duration"
              rules={{ required: t('actionDuration.required', { ns: 'fields' }) }}
              label={t('actionDuration.label', { ns: 'fields' })}
              options={actionDurationSelect}
              className="adminNewBasicAction__bonus__select adminNewBasicAction__bonus__value--s"
            />
            <Input
              control={control}
              type="textarea"
              inputName="summary"
              rules={{ required: t('actionSummary.required', { ns: 'fields' }) }}
              label={t('actionSummary.label', { ns: 'fields' })}
              className="adminNewBasicAction__bonus__value adminNewBasicAction__bonus__value--l"
            />
            <Input
              control={control}
              inputName="time"
              label={t('actionTime.label', { ns: 'fields' })}
              className="adminNewBasicAction__bonus__value adminNewBasicAction__bonus__value--s"
            />
            <Input
              control={control}
              inputName="damages"
              label={t('actionDamages.label', { ns: 'fields' })}
              className="adminNewBasicAction__bonus__value adminNewBasicAction__bonus__value--s"
            />
            <SmartSelect
              control={control}
              inputName="skill"
              label={t('actionSkill.label', { ns: 'fields' })}
              options={[
                {
                  value: '',
                  label: '',
                },
                ...skillSelect,
              ]}
              className="adminNewBasicAction__bonus__select adminNewBasicAction__bonus__value--s"
            />
            <Input
              control={control}
              inputName="offsetSkill"
              label={t('actionOffsetSkill.label', { ns: 'fields' })}
              className="adminNewBasicAction__bonus__value adminNewBasicAction__bonus__value--s"
            />
            <SmartSelect
              control={control}
              inputName="isKarmic"
              label={t('actionIsKarmic.label', { ns: 'fields' })}
              options={boolRange}
              className="adminNewBasicAction__bonus__select adminNewBasicAction__bonus__value--s"
            />
            <Input
              control={control}
              type="number"
              inputName="karmicCost"
              label={t('actionKarmicCost.label', { ns: 'fields' })}
              className="adminNewBasicAction__bonus__value adminNewBasicAction__bonus__value--s"
            />
            <Input
              control={control}
              type="number"
              inputName="uses"
              label={t('actionUses.label', { ns: 'fields' })}
              className="adminNewBasicAction__bonus__value adminNewBasicAction__bonus__value--l"
            />
            <Atitle className="adminNewBasicAction__bonus__title" level={4}>
              {t('adminNewBasicAction.actionInt', { ns: 'pages' })}
            </Atitle>
            <Input
              control={control}
              inputName="titleFr"
              label={`${t('actionTitle.label', { ns: 'fields' })} (FR)`}
              className="adminNewBasicAction__bonus__value adminNewBasicAction__bonus__value--l"
            />
            <Input
              control={control}
              type="textarea"
              inputName="summaryFr"
              label={`${t('actionSummary.label', { ns: 'fields' })} (FR)`}
              className="adminNewBasicAction__bonus__value adminNewBasicAction__bonus__value--l"
            />
            <Input
              control={control}
              inputName="timeFr"
              label={`${t('actionTime.label', { ns: 'fields' })} (FR)`}
              className="adminNewBasicAction__bonus__value adminNewBasicAction__bonus__value--l"
            />
          </div>
        </div>
        <Button type="submit">{t('adminNewBasicAction.createButton', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewBasicAction;
