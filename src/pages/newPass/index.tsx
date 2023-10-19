import React, { useEffect, type FC } from 'react';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import { useApi } from '../../providers/api';
import { Aerror, Ainput } from '../../atoms';
import { Button } from '../../molecules';

import './newPass.scss';

interface FormValues {
  mail: string
  password: string
  confirmPassword: string
}

const NewPassword: FC = () => {
  const { api } = useApi();
  const { t } = useTranslation('common');
  const { userId, token } = useParams();
  const navigate = useNavigate();

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    setError,
    formState: { errors }
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = ({ password, confirmPassword }) => {
    if (api !== undefined && userId !== undefined && token !== undefined) {
      api.auth.passUpdate({
        userId,
        token,
        pass: password,
        confirmPass: confirmPassword
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

  useEffect(() => {
    if (api !== undefined && userId !== undefined && token !== undefined) {
      api.mailToken.getMail({
        userId, token
      })
        .then((mail) => {
          setValue('mail', mail);
        })
        .catch((err) => {
          console.error('Cannot connect to the database!', err);
        });
    }
  }, [userId, token, api, setValue]);

  return (
    <div className="new-pass">
      <h1>New Password</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {errors.root?.serverError?.message !== undefined ? (<Aerror>{errors.root.serverError.message}</Aerror>) : null}
        <Ainput
          type="email"
          registered={register('mail')}
          placeholder="Mail..."
          autoComplete="username"
          hidden
          readOnly
        />
        <Ainput
          type="password"
          registered={register('password', {
            required: 'Password is required'
          })}
          placeholder="New Password..."
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
          Change Password
        </Button>
      </form>

    </div>
  );
};

export default NewPassword;
