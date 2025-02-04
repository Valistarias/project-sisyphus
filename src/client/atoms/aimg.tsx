import React, { type FC } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './aimg.scss';

interface IAimg {
  /** The url of the image */
  src: string;
}

const Aimg: FC<IQuarkProps<IAimg>> = ({ className, src }) => (
  <Quark
    quarkType="img"
    className={classTrim(`
        aimg
        ${className ?? ''}
      `)}
    src={src}
  />
);

export default Aimg;
