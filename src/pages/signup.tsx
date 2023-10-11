import React, { useState, type FC, useCallback } from 'react';

import './signup.scss';
import { useApi } from '../providers/api';
import { Ainput } from '../atoms';
import { Button } from '../molecules';

const Signup: FC = () => {
  const { api } = useApi();

  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');

  const onSignUp = useCallback(() => {
    if (api === undefined) { return; }
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
  }, [api, mail, password]);

  return (
    <div className="signup">
      <p>Signup</p>
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
        onClick={onSignUp}
      >
        Sign Me Up
      </Button>
    </div>
  );
};

export default Signup;
