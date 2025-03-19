import React, { useMemo, type FC } from 'react';

import holoBackground from '../assets/imgs/tvbg2.gif';
import { Quark, type IQuarkProps } from '../quark';

import type { TypeNodeIcons } from '../types/rules';

import { classTrim } from '../utils';

import './anodeIcon.scss';

interface IANodeIcon {
  /** The size of the node icon */
  size?: 'small' | 'medium' | 'large';
  /** The type of node icon */
  type: TypeNodeIcons;
  /** The level of rarity for the icon */
  rarity?: number;
  /** Is the background animated ? */
  animated?: boolean;
}

// When adding a new icon, dont forget to add it in the scss file, as before content
// AND in the TypeNodeIcons type

const ANodeIcon: FC<IQuarkProps<IANodeIcon>> = ({
  type,
  size = 'medium',
  className,
  rarity,
  animated = false,
}) => {
  const classes = useMemo<string>(
    () =>
      classTrim(`
    anodeicon
    anodeicon--${type}
    anodeicon--${size}
    ${className ?? ''}
    ${animated ? 'anodeicon--animated' : ''}
    ${rarity !== undefined ? `anodeicon--rarity anodeicon--rarity--${rarity}` : ''}
  `),
    [animated, className, rarity, size, type]
  );

  return (
    <Quark
      quarkType="span"
      style={animated ? { backgroundImage: `url(${holoBackground})` } : {}}
      className={classes}
    />
  );
};

export default ANodeIcon;
