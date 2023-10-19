import React, { type FC } from 'react';
import i18next from 'i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';

import { useApi } from '../../providers/api';
import { Aerror, Ainput } from '../../atoms';
import { Button } from '../../molecules';
import { regexMail } from '../../utils';

import './signup.scss';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface FormValues {
  mail: string
  password: string
  confirmPassword: string
}

const Signup: FC = () => {
  const { api } = useApi();
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors }
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = ({ mail, password }) => {
    if (api !== undefined) {
      api.auth.signup({
        mail,
        password
      })
        .then(() => {
          navigate('/');
        })
        .catch(({ response }) => {
          const { data } = response;
          if (data.code === 'CYPU-104') {
            setError(data.sent, {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`user.${data.sent}`), 'capitalize')
              })
            });
          } else {
            setError('root.serverError', {
              type: 'server',
              message: t(`serverErrors.${data.code}`, {
                field: i18next.format(t(`user.${data.sent}`), 'capitalize')
              })
            });
          }
        });
    }
  };

  return (
    <div className="signup">
      <h1>Signup</h1>
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
          autoComplete="email"
        />
        {errors.mail?.message !== undefined ? (<Aerror>{errors.mail.message}</Aerror>) : null}
        <Ainput
          type="password"
          registered={register('password', {
            required: 'Password is required'
          })}
          placeholder="Password..."
          autoComplete="new-password"
        />
        {errors.password?.message !== undefined ? (<Aerror>{errors.password.message}</Aerror>) : null}
        <Ainput
          type="password"
          registered={register('confirmPassword', {
            required: 'Password is required',
            validate: (val: string) => {
              if (watch('password') !== val) {
                return 'Your passwords do no match';
              }
            }
          })}
          placeholder="Confirm Password..."
          autoComplete="new-password"
        />
        {errors.confirmPassword?.message !== undefined ? (<Aerror>{errors.confirmPassword.message}</Aerror>) : null}
        <Button type="submit">
          Sign Me Up
        </Button>
      </form>

    </div>
  );
};

export default Signup;
