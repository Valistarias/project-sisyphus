import React, { type FC } from 'react';

// import { useTranslation } from 'react-i18next';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import tvBackground from '../../assets/imgs/tvbg.gif';
import { AnodeIcon, Ap, Atitle, Avideo } from '../../atoms';
import { Button } from '../../molecules';

import { classTrim } from '../../utils';

import './home.scss';

const Home: FC = () => {
  const { user } = useGlobalVars();
  const { t } = useTranslation();
  // const { createAlert, getNewId } = useSystemAlerts();

  // const onAddAlert = useCallback(() => {
  //   const newId = getNewId();
  //   createAlert({
  //     key: newId,
  //     dom: (
  //       <Alert key={newId} id={newId} closable>
  //         <Ap>Lorem Ipsum</Ap>
  //       </Alert>
  //     ),
  //   });
  // }, [createAlert, getNewId]);

  return (
    <div
      className={classTrim(`
        home
        ${user?._id === undefined ? '' : 'home--connected'}
      `)}
    >
      <div className="home__intro" style={{ backgroundImage: `url(${tvBackground})` }}>
        <Avideo video="logo" className="home__intro__logo" />
        <Atitle level={1} className="home__intro__title" />
        <div className="home__intro__line" />
        <Ap className="home__intro__text" />
        {user?._id === undefined ? (
          <div className="home__intro__buttons">
            <Button size="large" theme="afterglow" href="/signup">
              {t('home.registerCta', { ns: 'pages' })}
            </Button>
            <Button size="large" theme="text-only" href="/login">
              {t('home.loginCta', { ns: 'pages' })}
            </Button>
          </div>
        ) : null}
        <AnodeIcon type="explosion" />
      </div>

      {/* <Button onClick={onAddAlert}>Add alert</Button> */}
    </div>
  );
};

export default Home;
