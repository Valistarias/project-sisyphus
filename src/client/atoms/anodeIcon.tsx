import React, { useMemo, type FC } from 'react';

import { Quark, type IQuarkProps } from '../quark';
import { type TypeNodeIcons } from '../types/rules';

import { classTrim } from '../utils';

import './anodeIcon.scss';

interface IANodeIcon extends IQuarkProps {
  /** The size of the node icon */
  size?: 'small' | 'medium' | 'large';
  /** The type of node icon */
  type: TypeNodeIcons;
}

// When adding a new icon, dont forget to add it in the scss file, as before content
// and in the type TypeNodeIcons

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
