import React, { type FC } from 'react';

import { classTrim } from '../utils';

import './aimg.scss';

interface IAimg {
  /** The class of the IMG element */
  className?: string;
  /** The url of the image */
  src: string;
}

const Aimg: FC<IAimg> = ({ className, src }) => (
  <img
    className={classTrim(`
        aimg
        ${className ?? ''}
      `)}
    src={src}
  />
);

export default Aimg;
