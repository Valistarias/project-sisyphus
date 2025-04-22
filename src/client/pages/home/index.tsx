import React, { type FC } from 'react';

// import { useTranslation } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import { TypeAnimation } from 'react-type-animation';

import { useGlobalVars } from '../../providers';

import tvBackground from '../../assets/imgs/tvbg2.gif';
import { Ap, Atitle, Avideo } from '../../atoms';
import { LinkButton } from '../../molecules';

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
        <Atitle level={1} className="home__intro__title">
          <TypeAnimation sequence={['Sisyphusse']} cursor={true} speed={10} />
        </Atitle>
        <div className="home__intro__line" />
        <Ap className="home__intro__text">
          <TypeAnimation
            sequence={[
              3000, // Waits 3s
              'Live again, Die again, Die better',
              3000, // Waits 3s
              'A Tabletop RPG set in a strange future',
              3000, // Waits 3s
            ]}
            cursor={false}
            repeat={Infinity}
            speed={20}
            deletionSpeed={80}
          />
        </Ap>
        {user?._id === undefined ? (
          <div className="home__intro__buttons">
            <LinkButton size="large" theme="afterglow" href="/signup">
              {t('home.registerCta', { ns: 'pages' })}
            </LinkButton>
            <LinkButton size="large" theme="text-only" href="/login">
              {t('home.loginCta', { ns: 'pages' })}
            </LinkButton>
          </div>
        ) : null}
      </div>

      {/* <Button onClick={onAddAlert}>Add alert</Button> */}
    </div>
  );
};

export default Home;
