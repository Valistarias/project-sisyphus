import React, { useEffect, type FC } from 'react';
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
  const { userId, token } = useParams();
  const navigate = useNavigate();

  const {
    register,
    watch,
    handleSubmit,
    setValue,
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
        .catch((err) => {
          console.log('Cannot connect to the database!', err);
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
