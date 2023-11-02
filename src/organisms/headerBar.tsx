import React, { useCallback, type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';
import { useApi } from '../providers/api';
import { useGlobalVars } from '../providers/globalVars';

import { Aa } from '../atoms';
import { Button } from '../molecules';

import { classTrim } from '../utils';

import './headerBar.scss';

interface IHeaderBar {
  /** The class of the HeaderBar */
  className?: string;
}

const HeaderBar: FC<IHeaderBar> = ({ className }) => {
  const { api } = useApi();
  const { user, setUser } = useGlobalVars();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const userState = useMemo(() => {
    if (user === null) {
      return 'unlogged';
    }
    if (user.roles.find((role) => role.name === 'admin') !== undefined) {
      return 'admin';
    }
    return 'logged';
  }, [user]);

  const onLogout = useCallback(() => {
    if (api !== undefined) {
      api.auth
        .signout()
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
    <div
      className={classTrim(`
        headerbar
          ${className ?? ''}
        `)}
    >
      <div className="headerbar__content">
        <div className="headerbar__content__left">
          <Aa href="/">{t('home.title', { ns: 'pages' })}</Aa>
          {userState === 'unlogged' ? (
            <>
              <Aa href="/login">{t('login.title', { ns: 'pages' })}</Aa>
              <Aa href="/signup">{t('signup.title', { ns: 'pages' })}</Aa>
            </>
          ) : null}
          {userState !== 'unlogged' ? (
            <Aa href="/dashboard">{t('dashboard.title', { ns: 'pages' })}</Aa>
          ) : null}
          {userState === 'admin' ? (
            <Aa href="/admin">{t('admin.title', { ns: 'pages' })}</Aa>
          ) : null}
        </div>
        {userState !== 'unlogged' ? (
          <div className="headerbar__content__right">
            <Button onClick={onLogout}>{t('headerBar.logout', { ns: 'components' })}</Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default HeaderBar;
