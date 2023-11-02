import React, { useCallback, type FC } from 'react';

import { useSystemAlerts } from '../../providers/systemAlerts';
import { useTranslation } from 'react-i18next';

import { Ap, Atitle } from '../../atoms';
import { Button } from '../../molecules';
import { Alert } from '../../organisms';

import './home.scss';

const Home: FC = () => {
  const { t } = useTranslation();
  const { createAlert, getNewId } = useSystemAlerts();

  const onAddAlert = useCallback(() => {
    const newId = getNewId();
    createAlert({
      key: newId,
      dom: (
        <Alert
          key={newId}
          id={newId}
          // timer={5}
          closable
        >
          <Ap>Lorem Ipsum</Ap>
        </Alert>
      ),
    });
  }, [createAlert, getNewId]);

  return (
    <div className="home">
      <Atitle level={1}>{t('home.title', { ns: 'pages' })}</Atitle>
      <Button onClick={onAddAlert}>Add alert</Button>
    </div>
  );
};

export default Home;
