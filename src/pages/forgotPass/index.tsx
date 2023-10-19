import React, { type FC } from 'react';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useApi } from '../../providers/api';
import { Aerror, Ainput } from '../../atoms';
import { Button } from '../../molecules';
import { regexMail } from '../../utils';

import './forgotPass.scss';

interface FormValues {
  mail: string
}

const ForgotPassword: FC = () => {
  const { api } = useApi();
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = ({ mail }) => {
    if (api !== undefined) {
      api.mailToken.create({
        mail
      })
        .then(() => {
          navigate('/login');
        })
        .catch(({ response }) => {
          const { data } = response;
          setError('root.serverError', {
            type: 'server',
            message: t(`serverErrors.${data.code}`, {
              field: i18next.format(t(`user.${data.sent}`), 'capitalize')
            })
          });
        });
    }
  };

  return (
    <div className="forgot-pass">
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {errors.root?.serverError?.message !== undefined ? (<Aerror>{errors.root.serverError.message}</Aerror>) : null}
        <Ainput
          type="email"
          registered={register('mail', {
            required: 'Email Address is required',
            pattern: {
              value: regexMail,
              message: 'Mail not Ok'
            }
          })}
          placeholder="Mail..."
          autoComplete="username"
        />
        {errors.mail?.message !== undefined ? (<Aerror>{errors.mail.message}</Aerror>) : null}
        <Button type="submit">
          Send Email
        </Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
