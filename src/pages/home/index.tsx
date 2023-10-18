import React, { type FC } from 'react';

import { Aicon } from '../../atoms';

import './home.scss';

const Home: FC = () => {
  return (
    <div className="home">
      <p>Coucou</p>
      <Aicon type="edit" />
    </div>
  );
};

export default Home;
