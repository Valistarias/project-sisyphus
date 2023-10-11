import React, { type FC } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import { useApi } from '../providers/api';
import { Aerror, Ainput } from '../atoms';
import { Button } from '../molecules';
import { regexMail } from '../utils';

import './signup.scss';

interface FormValues {
  mail: string
  password: string
}

const Signup: FC = () => {
  const { api } = useApi();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = ({ mail, password }) => {
    if (api !== undefined) {
      api.auth.signup({
        mail,
        password
      })
        .then(() => {
          console.log('Connected!');
        })
        .catch((err) => {
          console.log('Cannot connect to the database!', err);
        });
    }
  };

  return (
    <div className="signup">
      <h1>Signup</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
        <Button type="submit">
          Sign Me Up
        </Button>
      </form>

    </div>
  );
};

export default Signup;
