import React, { useCallback, useEffect, useMemo, useRef, useState, type FC } from 'react';

import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi, useConfirmMessage, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input, LinkButton, SmartSelect } from '../../../molecules';
import { Alert } from '../../../organisms';

import type { ConfirmMessageDetailData } from '../../../providers/confirmMessage';
import type { ICuratedAction } from '../../../types';
import type { ErrorResponseType } from '../../../types/global';

import { classTrim } from '../../../utils';

import './adminEditBasicAction.scss';

interface FormValues {
  id: string;
  title: string;
  titleFr?: string;
  summary: string;
  summaryFr?: string;
  type: string;
  skill?: string;
  duration: string;
  time?: string;
  timeFr?: string;
  damages?: string;
  offsetSkill?: string;
  uses?: number;
  isKarmic?: string;
  karmicCost?: number;
}

const AdminEditBasicAction: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { id } = useParams();
  const { setConfirmContent, removeConfirmEventListener, addConfirmEventListener } =
    useConfirmMessage();
  const { skills, actionTypes, actionDurations, reloadBasicActions } = useGlobalVars();
  const { createAlert, getNewId } = useSystemAlerts();
  const navigate = useNavigate();

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

  const calledApi = useRef(false);

  const [actionData, setActionData] = useState<ICuratedAction | null>(null);

  const createDefaultData = useCallback((actionData: ICuratedAction | null) => {
    if (actionData == null) {
      return {};
    }
    const { action } = actionData;

    return {
      id: action._id,
      title: action.title,
      type: action.type,
      duration: action.duration,
      isKarmic: action.isKarmic ? '1' : '0',
      ...(action.skill !== undefined ? { skill: action.skill } : {}),
      ...(action.damages !== undefined ? { damages: action.damages } : {}),
      ...(action.offsetSkill !== undefined ? { offsetSkill: action.offsetSkill } : {}),
      ...(action.uses !== undefined ? { uses: action.uses } : {}),
      ...(action.karmicCost !== undefined ? { karmicCost: action.karmicCost } : {}),
      ...(action.time !== undefined ? { time: action.time } : {}),
      summary: action.summary,
      titleFr: action.i18n.fr?.title,
      summaryFr: action.i18n.fr?.summary,
      timeFr: action.i18n.fr?.time,
    };
  }, []);

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: useMemo(() => createDefaultData(actionData), [createDefaultData, actionData]),
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

  const onSaveNode: SubmitHandler<FormValues> = useCallback(
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
        .update({
          id,
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
        })
        .then((quote) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminEditBasicAction.successUpdate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          reloadBasicActions();
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
    [api, id, getNewId, createAlert, t, reloadBasicActions, setError]
  );

  const onAskDelete = useCallback(() => {
    if (api === undefined || actionData === null) {
      return;
    }
    setConfirmContent(
      {
        title: t('adminEditBasicAction.confirmDeletion.title', { ns: 'pages' }),
        text: t('adminEditBasicAction.confirmDeletion.text', {
          ns: 'pages',
          elt: actionData.action.title,
        }),
        confirmCta: t('adminEditBasicAction.confirmDeletion.confirmCta', { ns: 'pages' }),
      },
      (evtId: string) => {
        const confirmDelete = ({ detail }: { detail: ConfirmMessageDetailData }): void => {
          if (detail.proceed) {
            api.nodes
              .delete({ id })
              .then(() => {
                const newId = getNewId();
                createAlert({
                  key: newId,
                  dom: (
                    <Alert key={newId} id={newId} timer={5}>
                      <Ap>{t('adminEditBasicAction.successDelete', { ns: 'pages' })}</Ap>
                    </Alert>
                  ),
                });
                void navigate('/admin/basicactions');
              })
              .catch(({ response }: ErrorResponseType) => {
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
          removeConfirmEventListener(evtId, confirmDelete);
        };
        addConfirmEventListener(evtId, confirmDelete);
      }
    );
  }, [
    api,
    actionData,
    setConfirmContent,
    t,
    addConfirmEventListener,
    removeConfirmEventListener,
    id,
    getNewId,
    createAlert,
    navigate,
    setError,
  ]);

  useEffect(() => {
    if (api !== undefined && id !== undefined && !calledApi.current && skills.length !== 0) {
      calledApi.current = true;
      api.actions
        .get({ actionId: id })
        .then((curatedAction) => {
          setActionData(curatedAction);
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
  }, [api, createAlert, getNewId, skills, id, t]);

  // To affect default data
  useEffect(() => {
    reset(createDefaultData(actionData));
  }, [actionData, reset, createDefaultData]);

  return (
    <div
      className={classTrim(`
        adminEditBasicAction
      `)}
    >
      <form
        className="adminEditBasicAction__content"
        onSubmit={(evt) => {
          void handleSubmit(onSaveNode)(evt);
        }}
        noValidate
      >
        <div className="adminEditBasicAction__head">
          <Atitle className="adminEditBasicAction__head" level={1}>
            {t('adminEditBasicAction.title', { ns: 'pages' })}
          </Atitle>
          <Button onClick={onAskDelete} color="error">
            {t('adminEditBasicAction.delete', { ns: 'pages' })}
          </Button>
        </div>
        <LinkButton className="adminEditBag__return-btn" href="/admin/basicactions" size="small">
          {t('adminEditBasicAction.return', { ns: 'pages' })}
        </LinkButton>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminEditBasicAction__bonus__fields adminEditBasicAction__bonus__fields--large">
          <Input
            control={control}
            inputName="title"
            rules={{ required: t('actionTitle.required', { ns: 'fields' }) }}
            label={t('actionTitle.label', { ns: 'fields' })}
            className="adminEditBasicAction__bonus__value adminEditBasicAction__bonus__value--l"
          />
          <SmartSelect
            control={control}
            inputName="type"
            rules={{ required: t('actionType.required', { ns: 'fields' }) }}
            label={t('actionType.label', { ns: 'fields' })}
            options={actionTypeSelect}
            className="adminEditBasicAction__bonus__select adminEditBasicAction__bonus__value--s"
          />
          <SmartSelect
            control={control}
            inputName="duration"
            rules={{ required: t('actionDuration.required', { ns: 'fields' }) }}
            label={t('actionDuration.label', { ns: 'fields' })}
            options={actionDurationSelect}
            className="adminEditBasicAction__bonus__select adminEditBasicAction__bonus__value--s"
          />
          <Input
            control={control}
            type="textarea"
            inputName="summary"
            rules={{ required: t('actionSummary.required', { ns: 'fields' }) }}
            label={t('actionSummary.label', { ns: 'fields' })}
            className="adminEditBasicAction__bonus__value adminEditBasicAction__bonus__value--l"
          />
          <Input
            control={control}
            inputName="time"
            label={t('actionTime.label', { ns: 'fields' })}
            className="adminEditBasicAction__bonus__value adminEditBasicAction__bonus__value--s"
          />
          <Input
            control={control}
            inputName="damages"
            label={t('actionDamages.label', { ns: 'fields' })}
            className="adminEditBasicAction__bonus__value adminEditBasicAction__bonus__value--s"
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
            className="adminEditBasicAction__bonus__select adminEditBasicAction__bonus__value--s"
          />
          <Input
            control={control}
            inputName="offsetSkill"
            label={t('actionOffsetSkill.label', { ns: 'fields' })}
            className="adminEditBasicAction__bonus__value adminEditBasicAction__bonus__value--s"
          />
          <SmartSelect
            control={control}
            inputName="isKarmic"
            label={t('actionIsKarmic.label', { ns: 'fields' })}
            options={boolRange}
            className="adminEditBasicAction__bonus__select adminEditBasicAction__bonus__value--s"
          />
          <Input
            control={control}
            type="number"
            inputName="karmicCost"
            label={t('actionKarmicCost.label', { ns: 'fields' })}
            className="adminEditBasicAction__bonus__value adminEditBasicAction__bonus__value--s"
          />
          <Input
            control={control}
            type="number"
            inputName="uses"
            label={t('actionUses.label', { ns: 'fields' })}
            className="adminEditBasicAction__bonus__value adminEditBasicAction__bonus__value--l"
          />
          <Atitle className="adminEditBasicAction__bonus__title" level={4}>
            {t('adminEditBasicAction.actionInt', { ns: 'pages' })}
          </Atitle>
          <Input
            control={control}
            inputName="titleFr"
            label={`${t('actionTitle.label', { ns: 'fields' })} (FR)`}
            className="adminEditBasicAction__bonus__value adminEditBasicAction__bonus__value--l"
          />
          <Input
            control={control}
            type="textarea"
            inputName="summaryFr"
            label={`${t('actionSummary.label', { ns: 'fields' })} (FR)`}
            className="adminEditBasicAction__bonus__value adminEditBasicAction__bonus__value--l"
          />
          <Input
            control={control}
            inputName="timeFr"
            label={`${t('actionTime.label', { ns: 'fields' })} (FR)`}
            className="adminEditBasicAction__bonus__value adminEditBasicAction__bonus__value--l"
          />
        </div>
        <Button type="submit">{t('adminEditBasicAction.createButton', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminEditBasicAction;
