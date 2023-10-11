import React, { useState, type FC, useCallback } from 'react';

import './login.scss';
import { useApi } from '../providers/api';
import { Ainput } from '../atoms';
import { Button } from '../molecules';

const Login: FC = () => {
  const { api } = useApi();

  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');

  const onSignIn = useCallback(() => {
    if (api === undefined) { return; }
    api.auth.signin({
      mail,
      password
    })
      .then(() => {
        console.log('Connected!');
      })
      .catch((err) => {
        console.log('Cannot connect to the database!', err);
      });
  }, [api, mail, password]);

  return (
    <div className="login">
      <Ainput
        id="mail"
        onChange={(e) => { setMail(e.target.value); }}
        value={mail}
        placeholder="Mail..."
      />
      <Ainput
        id="password"
        onChange={(e) => { setPassword(e.target.value); }}
        value={password}
        placeholder="Password..."
      />
      <Button
        onClick={onSignIn}
      >
        Log In
      </Button>
    </div>
  );
};

export default Login;
