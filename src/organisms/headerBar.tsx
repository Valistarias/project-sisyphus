import React, { useCallback, type FC } from 'react';

import { useNavigate } from 'react-router-dom';
import { useApi } from '../providers/api';
import { useGlobalVars } from '../providers/GlobalVars';

import { Aa } from '../atoms';

import './headerBar.scss';
import { Button } from '../molecules';

const HeaderBar: FC = () => {
  const { api } = useApi();
  const { user, setUser } = useGlobalVars();
  const navigate = useNavigate();

  const onLogout = useCallback(() => {
    if (api !== undefined) {
      api.auth.signout()
        .then((res) => {
          setUser(null);
          navigate('/');
        })
        .catch((err) => {
          console.error('Cannot disconnect to the database!', err);
        });
    }
  }, [api, navigate, setUser]);
  return (
    <div className="headerbar">
      <Aa href="/">Home</Aa>
      { user !== null
        ? (
          <>
            <Aa href="/dashboard">Dashboard</Aa>
            <Button onClick={onLogout}>Log out</Button>
          </>
          )
        : (
          <>
            <Aa href="/login">Login</Aa>
            <Aa href="/signup">Register</Aa>
          </>
          )}
    </div>
  );
};

export default HeaderBar;
