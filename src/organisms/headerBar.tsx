import React, { type FC } from 'react';

import './headerBar.scss';
import { Aa } from '../atoms';

const HeaderBar: FC = () => {
  return (
    <div className="headerbar">
      <Aa href="/">Home</Aa>
      <Aa href="/login">Login</Aa>
      <Aa href="/signup">Register</Aa>
    </div>
  );
};

export default HeaderBar;
