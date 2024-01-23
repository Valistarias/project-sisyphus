import React, { useCallback, useEffect, useMemo, useState, type FC } from 'react';

import i18next from 'i18next';
import { useForm, type FieldValues, type SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useApi, useSystemAlerts } from '../../providers';

import { Aerror, Ali, Ap, Atitle, Aul } from '../../atoms';
import { Button, Input } from '../../molecules';
import { Alert } from '../../organisms';
import { type IRuleBookType } from '../../types/data';

import './adminRuleBookTypes.scss';

interface FormValues {
  name: string;
}

const AdminRuleBookTypes: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const [ruleBookTypes, setRuleBookTypes] = useState<IRuleBookType[]>([]);
  const [createBookTypeMode, setCreateBookTypeMode] = useState(false);
  const [updateBookTypeMode, setUpdateBookTypeMode] = useState('');
  const [deleteBookTypeMode, setDeleteBookTypeMode] = useState('');

  const {
    control,
    handleSubmit,
    setError,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>();

  const loadRuleBookTypes = useCallback(() => {
    if (api !== undefined) {
      api.ruleBookTypes
        .getAll()
        .then((data: IRuleBookType[]) => {
          setRuleBookTypes(data);
        })
        .catch(({ response }) => {
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
  }, [api, createAlert, getNewId, t]);

  const onSubmit: SubmitHandler<FormValues> = ({ name }) => {
    if (api !== undefined) {
      if (updateBookTypeMode !== '') {
        // Updating a Rulebook Type
        api.ruleBookTypes
          .update({
            id: updateBookTypeMode,
            name,
          })
          .then(() => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('adminRuleBooks.successUpdateType', { ns: 'pages' })}</Ap>
                </Alert>
              ),
            });
            loadRuleBookTypes();
            setUpdateBookTypeMode('');
            reset();
          })
          .catch(({ response }) => {
            const { data } = response;
            if (data.code === 'CYPU-104') {
              setError(data.sent as 'name', {
                type: 'server',
                message: t(`serverErrors.${data.code}`, {
                  field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize'),
                }),
              });
            } else {
              setError('root.serverError', {
                type: 'server',
                message: t(`serverErrors.${data.code}`, {
                  field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize'),
                }),
              });
            }
          });
      } else {
        // Creating a Rulebook Type
        api.ruleBookTypes
          .create({
            name,
          })
          .then(() => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('adminRuleBooks.successCreateType', { ns: 'pages' })}</Ap>
                </Alert>
              ),
            });
            loadRuleBookTypes();
            setCreateBookTypeMode(false);
            reset();
          })
          .catch(({ response }) => {
            const { data } = response;
            if (data.code === 'CYPU-104') {
              setError(data.sent as 'name', {
                type: 'server',
                message: t(`serverErrors.${data.code}`, {
                  field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize'),
                }),
              });
            } else {
              setError('root.serverError', {
                type: 'server',
                message: t(`serverErrors.${data.code}`, {
                  field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize'),
                }),
              });
            }
          });
      }
    }
  };

  const onClickUpdate = useCallback(
    (_id: string, name: string) => {
      setValue('name', name);
      setUpdateBookTypeMode(_id);
    },
    [setValue]
  );

  const onClickDeletion = useCallback(
    (_id: string) => {
      if (api !== undefined) {
        if (deleteBookTypeMode === '') {
          setDeleteBookTypeMode(_id);
        } else if (deleteBookTypeMode !== _id) {
          setDeleteBookTypeMode('');
        } else {
          api.ruleBookTypes
            .delete({ id: _id })
            .then(() => {
              const newId = getNewId();
              createAlert({
                key: newId,
                dom: (
                  <Alert key={newId} id={newId} timer={5}>
                    <Ap>{t('adminRuleBooks.successDeleteType', { ns: 'pages' })}</Ap>
                  </Alert>
                ),
              });
              loadRuleBookTypes();
              setDeleteBookTypeMode('');
            })
            .catch(({ response }) => {
              const { data } = response;
              const newId = getNewId();
              createAlert({
                key: newId,
                dom: (
                  <Alert key={newId} id={newId} timer={5}>
                    <Ap>
                      {t(`serverErrors.${data.code}`, {
                        field: data.sent,
                      })}
                    </Ap>
                  </Alert>
                ),
              });
              setDeleteBookTypeMode('');
            });
        }
      }
    },
    [deleteBookTypeMode, api, getNewId, createAlert, t, loadRuleBookTypes]
  );

  const rulebookTypesDom = useMemo(
    () =>
      ruleBookTypes.map(({ name, _id }) => (
        <Ali key={_id} className="adminRuleBooktypes__list__elt">
          <Ap>
            {t(`ruleBookTypeNames.${name}`, { count: 1 })}
            {` (${name})`}
          </Ap>
          <div className="adminRuleBooktypes__list__elt__buttons">
            <Button
              size="small"
              onClick={() => {
                onClickUpdate(_id, name);
              }}
              icon="edit"
            />
            <Button
              size="small"
              onClick={() => {
                onClickDeletion(_id);
              }}
              icon="delete"
            />
          </div>
        </Ali>
      )),
    [ruleBookTypes, onClickUpdate, onClickDeletion, t]
  );

  const createUpdateRuleBookTypesText = useMemo(() => {
    if (updateBookTypeMode !== '') {
      return t('adminRuleBooks.updateType', { ns: 'pages' });
    }
    return createBookTypeMode
      ? t('adminRuleBooks.saveType', { ns: 'pages' })
      : t('adminRuleBooks.createType', { ns: 'pages' });
  }, [createBookTypeMode, t, updateBookTypeMode]);

  useEffect(() => {
    loadRuleBookTypes();
  }, [loadRuleBookTypes]);

  return (
    <div className="adminRuleBooktypes">
      <Atitle level={2}>
        {i18next.format(t('terms.ruleBook.type', { count: ruleBookTypes.length }), 'capitalize')}
      </Atitle>
      {deleteBookTypeMode !== '' ? (
        <Ap className="adminRuleBooktypes__alert">
          {t('adminRuleBooks.deleteRuleBookTypeMessage', { ns: 'pages' })}
        </Ap>
      ) : null}
      <Aul className="adminRuleBooktypes__list" noPoints>
        {ruleBookTypes.length > 0 ? rulebookTypesDom : null}
      </Aul>
      <div className="adminRuleBooktypes__create">
        {createBookTypeMode || updateBookTypeMode !== '' ? (
          <form className="signup__form" onSubmit={handleSubmit(onSubmit)}>
            {errors.root?.serverError?.message !== undefined ? (
              <Aerror>{errors.root.serverError.message}</Aerror>
            ) : null}
            <Input
              control={control}
              inputName="name"
              type="text"
              size="small"
              rules={{
                required: t('nameRuleBookType.required', { ns: 'fields' }),
              }}
              label={t('nameRuleBookType.label', { ns: 'fields' })}
            />
          </form>
        ) : null}
        <div className="adminRuleBooktypes__create__buttons">
          <Button
            size="small"
            onClick={
              createBookTypeMode || updateBookTypeMode !== ''
                ? handleSubmit(onSubmit)
                : () => {
                    setCreateBookTypeMode(true);
                  }
            }
          >
            {createUpdateRuleBookTypesText}
          </Button>
          {createBookTypeMode || updateBookTypeMode !== '' ? (
            <Button
              size="small"
              onClick={() => {
                setCreateBookTypeMode(false);
                setUpdateBookTypeMode('');
                reset();
              }}
            >
              {t('adminRuleBooks.abortSaveType', { ns: 'pages' })}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminRuleBookTypes;
