import React, { type FC } from 'react';

// import { useTranslation } from 'react-i18next';

import tvBackground from '../../assets/imgs/tvbg.gif';
import { Ap, Atitle, Avideo } from '../../atoms';

import './home.scss';

const Home: FC = () => {
  // const { t } = useTranslation();
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
    <div className="home">
      <div className="home__intro" style={{ backgroundImage: `url(${tvBackground})` }}>
        <Avideo video="logo" className="home__intro__logo" />
        <Atitle level={1} className="home__intro__title" />
        <div className="home__intro__line" />
        <Ap className="home__intro__text" />
      </div>

      {/* <Button onClick={onAddAlert}>Add alert</Button> */}
    </div>
  );
};

export default Home;
