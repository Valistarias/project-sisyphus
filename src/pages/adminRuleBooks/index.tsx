import React, { type FC, useEffect, useState, useMemo, useCallback } from 'react';
import i18next from 'i18next';

import { useTranslation } from 'react-i18next';
import { useApi } from '../../providers/api';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useSystemAlerts } from '../../providers/systemAlerts';

import { type IRuleBookType, type IRuleBook } from '../../interfaces';

import { Aerror, Ainput, Ali, Ap, Atitle, Aul } from '../../atoms';
import { Button } from '../../molecules';
import { Alert } from '../../organisms';

import './adminRuleBooks.scss';

interface FormValues {
  name: string
}

const AdminRuleBooks: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const [ruleBooks, setRuleBooks] = useState<IRuleBook[]>([]);

  const [ruleBookTypes, setRuleBookTypes] = useState<IRuleBookType[]>([]);
  const [createBookTypeMode, setCreateBookTypeMode] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors }
  } = useForm<FormValues>();

  const loadRuleBookTypes = useCallback(() => {
    if (api !== undefined) {
      api.ruleBookTypes.getAll()
        .then((data: IRuleBookType[]) => {
          setRuleBookTypes(data);
        })
        .catch(({ response }) => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert
                key={newId}
                id={newId}
                timer={5}
              >
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            )
          });
        });
    }
  }, [api, createAlert, getNewId, t]);

  const onSubmit: SubmitHandler<FormValues> = ({ name }) => {
    if (api !== undefined) {
      api.ruleBookTypes.create({
        name
      })
        .then(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert
                key={newId}
                id={newId}
                timer={5}
              >
                <Ap>{t('adminRuleBooks.successCreateType', { ns: 'pages' })}</Ap>
              </Alert>
            )
          });
          loadRuleBookTypes();
          setCreateBookTypeMode(false);
          reset();
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError(data.sent, {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize')
              })
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`terms.ruleBookType.${data.sent}`), 'capitalize')
              })
            });
          }
        });
    }
  };

  useEffect(() => {
    if (api !== undefined) {
      api.ruleBooks.getAll()
        .then((data: IRuleBook[]) => {
          setRuleBooks(data);
        })
        .catch(({ response }) => {
          // TODO : Error Popup
        });
      loadRuleBookTypes();
    }
  }, [api, loadRuleBookTypes]);

  const rulebookTypesDom = useMemo(() => ruleBookTypes.map(({ name, _id }) => (
    <Ali key={_id} className="adminRuleBooks__types__list__elt"><Ap>{name}</Ap></Ali>
  )), [ruleBookTypes]);

  return (
    <div className="adminRuleBooks">
      <Atitle level={1}>{t('adminRuleBooks.title', { ns: 'pages' })}</Atitle>
      <div className="adminRuleBooks__content">
        <div className="adminRuleBooks__books">
          <Atitle level={2}>{t('adminRuleBooks.list', { ns: 'pages' })}</Atitle>
        </div>
        <div className="adminRuleBooks__types">
          <Atitle level={2}>{i18next.format(t('terms.ruleBook.type', { count: ruleBookTypes.length }), 'capitalize')}</Atitle>
          <Aul className="adminRuleBooks__types__list">
            {
              ruleBookTypes.length > 0 ? rulebookTypesDom : null
            }
          </Aul>
          <div className="adminRuleBooks__types__create">
            {
              createBookTypeMode
                ? (
                <form className="signup__form">
                  {errors.root?.serverError?.message !== undefined ? (<Aerror>{errors.root.serverError.message}</Aerror>) : null}
                  <Ainput
                    type="text"
                    size="small"
                    registered={register('name', {
                      required: t('nameRuleBookType.required', { ns: 'fields' })
                    })}
                    placeholder={t('nameRuleBookType.placeholder', { ns: 'fields' })}
                  />
                  {errors.name?.message !== undefined ? (<Aerror>{errors.name.message}</Aerror>) : null}
                </form>
                  )
                : null
            }
            <div className="adminRuleBooks__types__create__buttons">
              <Button
                size="small"
                onClick={createBookTypeMode ? handleSubmit(onSubmit) : () => { setCreateBookTypeMode(true); }}
              >
                {createBookTypeMode ? t('adminRuleBooks.saveType', { ns: 'pages' }) : t('adminRuleBooks.createType', { ns: 'pages' })}
              </Button>
              {
              createBookTypeMode
                ? (
                  <Button
                    size="small"
                    onClick={() => { setCreateBookTypeMode(false); }}
                  >
                    {t('adminRuleBooks.abortSaveType', { ns: 'pages' })}
                  </Button>
                  )
                : null
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRuleBooks;
