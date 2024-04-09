import React, { useMemo, type FC } from 'react';

import { Quark, type IQuarkProps } from '../quark';
import { type typeNodeIcons } from '../types/rules';

import { classTrim } from '../utils';

import './anodeIcon.scss';

interface IANodeIcon extends IQuarkProps {
  /** The size of the icon */
  size?: 'small' | 'medium' | 'large';
  /** The type of icon */
  type: typeNodeIcons;
  /** When the icon is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

const ANodeIcon: FC<IANodeIcon> = ({ type, size = 'medium', className, onClick }) => {
  const classes = useMemo<string>(
    () =>
      classTrim(`
    anodeicon
    anodeicon--${type}
    anodeicon--${size}
    ${className ?? ''}
  `),
    [className, size, type]
  );

  return <Quark quarkType="span" className={classes} />;
};

export default ANodeIcon;
