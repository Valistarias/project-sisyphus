import React, { useCallback, useMemo, useState, type FC } from 'react';

import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../../../providers';

import { Aa, Aerror, Ap, Atitle } from '../../../atoms';
import { Button, Input } from '../../../molecules';
import { Alert } from '../../../organisms';

import './adminNewVow.scss';
import type { ErrorResponseType, InternationalizationType } from '../../../types/global';

import { classTrim } from '../../../utils';

interface FormValues {
  name: string;
  nameFr: string;
}

const AdminNewVow: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { createAlert, getNewId } = useSystemAlerts();
  const { clergies } = useGlobalVars();

  const [displayInt, setDisplayInt] = useState(false);

  const params = useMemo(() => new URLSearchParams(search), [search]);

  const {
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm();

  const linkedClergy = useMemo(() => {
    const clergyId = params.get('clergyId');
    if (clergyId === null) {
      return null;
    }
    const clergy = clergies.find((cleanClergy) => cleanClergy.clergy._id === clergyId);

    if (clergy === undefined) {
      return null;
    }

    return clergy;
  }, [clergies, params]);

  const onSaveVow: SubmitHandler<FormValues> = useCallback(
    ({ name, nameFr }) => {
      if (api === undefined) {
        return;
      }

      let i18n: InternationalizationType | null = null;

      if (nameFr !== '') {
        i18n = {
          fr: {
            title: nameFr,
          },
        };
      }

      api.vows
        .create({
          title: name,
          clergy: params.get('clergyId'),
          i18n,
        })
        .then((vow) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('adminNewVow.successCreate', { ns: 'pages' })}</Ap>
              </Alert>
            ),
          });
          void navigate(`/admin/vow/${vow._id}`);
        })
        .catch(({ response }: ErrorResponseType) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.vowType.${data.sent}`), 'capitalize'),
              }),
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.vowType.${data.sent}`), 'capitalize'),
              }),
            });
          }
        });
    },
    [api, params, getNewId, createAlert, t, navigate, setError]
  );

  return (
    <div
      className={classTrim(`
        adminNewVow
        ${displayInt ? 'adminNewVow--int-visible' : ''}
      `)}
    >
      <form
        onSubmit={(evt) => {
          void handleSubmit(onSaveVow)(evt);
        }}
        noValidate
        className="adminNewVow__content"
      >
        <Atitle level={1}>{t('adminNewVow.title', { ns: 'pages' })}</Atitle>
        <div className="adminNewVow__ariane">
          <Ap className="adminNewVow__ariane__elt">
            {`${t('terms.clergy.name')}:`}
            <Aa href={`/admin/clergy/${linkedClergy?.clergy._id}`}>{linkedClergy?.clergy.title}</Aa>
          </Ap>
        </div>
        {errors.root?.serverError.message !== undefined ? (
          <Aerror>{errors.root.serverError.message}</Aerror>
        ) : null}
        <div className="adminNewVow__basics">
          <Input
            control={control}
            inputName="name"
            rules={{ required: t('nameVow.required', { ns: 'fields' }) }}
            type="text"
            label={t('nameVow.label', { ns: 'fields' })}
            className="adminNewVow__basics__name"
          />
        </div>

        <div className="adminNewVow__intl-title">
          <div className="adminNewVow__intl-title__content">
            <Atitle className="adminNewVow__intl-title__title" level={2}>
              {t('adminNewVow.i18n', { ns: 'pages' })}
            </Atitle>
            <Ap className="adminNewVow__intl-title__info">
              {t('adminNewVow.i18nInfo', { ns: 'pages' })}
            </Ap>
          </div>
          <Button
            icon="Arrow"
            theme="afterglow"
            onClick={() => {
              setDisplayInt((prev) => !prev);
            }}
            className="adminNewVow__intl-title__btn"
          />
        </div>
        <div className="adminNewVow__intl">
          <div className="adminNewVow__basics">
            <Input
              control={control}
              inputName="nameFr"
              type="text"
              label={`${t('nameClergy.label', { ns: 'fields' })} (FR)`}
              className="adminNewVow__basics__name"
            />
          </div>
        </div>
        <Button type="submit">{t('adminNewVow.button', { ns: 'pages' })}</Button>
      </form>
    </div>
  );
};

export default AdminNewVow;
