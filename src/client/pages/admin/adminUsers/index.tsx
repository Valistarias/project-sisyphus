import React, { useEffect, useMemo, useRef, useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useApi, useSystemAlerts } from '../../../providers';

import { Ali, Ap, Atitle, Aul } from '../../../atoms';
import { LinkButton } from '../../../molecules';
import { Alert } from '../../../organisms';

import type { IUser } from '../../../types';

import { classTrim } from '../../../utils';

import './adminUsers.scss';

const AdminUsers: FC = () => {
  const { t } = useTranslation();
  const { api } = useApi();
  const { createAlert, getNewId } = useSystemAlerts();

  const calledApi = useRef(false);

  const [users, setUsers] = useState<IUser[]>([]);

  // TODO: Handle i18n in place of basic english language
  const usersList = useMemo(() => {
    if (users.length === 0) {
      return null;
    }

    return (
      <Aul className="adminUsers__user-list" noPoints>
        {users.map((user) => (
          <Ali
            className={classTrim(`
              adminUsers__user-list__elt
            `)}
            key={user._id}
          >
            <Atitle level={3}>{user.mail}</Atitle>
            <LinkButton href={`/admin/user/${user._id}`}>
              {t('adminUsers.editUser', { ns: 'pages' })}
            </LinkButton>
          </Ali>
        ))}
      </Aul>
    );
  }, [users, t]);

  useEffect(() => {
    if (api !== undefined && !calledApi.current) {
      calledApi.current = true;
      api.users
        .getAll()
        .then((curatedUsers) => {
          setUsers(curatedUsers);
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
  }, [api, createAlert, getNewId, t]);

  return (
    <div className="adminUsers">
      <Atitle level={1}>{t('adminUsers.title', { ns: 'pages' })}</Atitle>
      <div className="adminUsers__content">
        <div className="adminUsers__users">
          <Atitle level={2}>{t('adminUsers.list', { ns: 'pages' })}</Atitle>
          <div className="adminUsers__users__list">{usersList}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
