import React, { type FC } from 'react';

import { Aa } from '../atoms';

import './home.scss';

const Test: FC = () => {
  return (
    <div className="test">
      <p>Test</p>
      <Aa href="/">Your Name</Aa>
    </div>
  );
};

export default Test;
