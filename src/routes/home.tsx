import React, { type FC } from 'react';

import { Aa, Aicon } from '../atoms';

import './home.scss';

const Home: FC = () => {
  return (
    <div className="home">
      <p>Coucou</p>
      <Aicon type="edit" />
      <Aa href="/contacts/1">Your Name</Aa>
    </div>
  );
};

export default Home;
