import React, { useCallback, useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useApi, useGlobalVars, useSystemAlerts } from '../providers';

import { Aa, Ap } from '../atoms';
import { Button, DropDownList } from '../molecules';

import Alert from './alert';

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
  const { createAlert, getNewId } = useSystemAlerts();
  const { ruleBooks } = useGlobalVars();

  const userState = useMemo(() => {
    if (user === null) {
      return 'unlogged';
    }
    if (user.roles.find((role) => role.name === 'admin') !== undefined) {
      return 'admin';
    }
    return 'logged';
  }, [user]);

  const cleanedRuleBooks = useMemo(
    () => ruleBooks.filter(({ ruleBook }) => !ruleBook.archived),
    [ruleBooks]
  );

  const onLogout = useCallback(() => {
    if (api !== undefined) {
      api.auth
        .signout()
        .then((res) => {
          setUser(null);
          navigate('/');
        })
        .catch(() => {
          const newId = getNewId();
          createAlert({
            key: newId,
            dom: (
              <Alert key={newId} id={newId} timer={5}>
                <Ap>{t('serverErrors.CYPU-301')}</Ap>
              </Alert>
            ),
          });
        });
    }
  }, [api, createAlert, getNewId, navigate, setUser, t]);

  return (
    <div
      className={classTrim(`
        headerbar
          ${className ?? ''}
        `)}
    >
      <div className="headerbar__content">
        <div className="headerbar__content__left">
          <Aa className="headerbar__fullheight" href="/">
            {t('home.title', { ns: 'pages' })}
          </Aa>
          {userState === 'unlogged' ? (
            <>
              <Aa className="headerbar__fullheight" href="/login">
                {t('login.title', { ns: 'pages' })}
              </Aa>
              <Aa className="headerbar__fullheight" href="/signup">
                {t('signup.title', { ns: 'pages' })}
              </Aa>
            </>
          ) : null}
          {userState !== 'unlogged' ? (
            <>
              <Aa className="headerbar__fullheight" href="/dashboard">
                {t('dashboard.title', { ns: 'pages' })}
              </Aa>
              <Aa className="headerbar__fullheight" href="/characters">
                {t('characters.title', { ns: 'pages' })}
              </Aa>
              <Aa className="headerbar__fullheight" href="/campaigns">
                {t('campaigns.title', { ns: 'pages' })}
              </Aa>
              <DropDownList
                title={{
                  href: '/rulebooks',
                  text: t('ruleBooks.title', { ns: 'pages' }),
                }}
                content={cleanedRuleBooks.map(({ ruleBook }) => ({
                  href: `/rulebook/${ruleBook._id}`,
                  // TODO: Handle Internationalization
                  text: ruleBook.title,
                }))}
                className="headerbar__fullheight"
              />
            </>
          ) : null}

          {userState === 'admin' ? (
            <DropDownList
              title={{
                href: '/admin',
                text: t('admin.title', { ns: 'pages' }),
              }}
              content={[
                {
                  href: '/admin/rulebooks',
                  text: t('adminRuleBooks.title', { ns: 'pages' }),
                },
              ]}
              className="headerbar__fullheight"
            />
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
