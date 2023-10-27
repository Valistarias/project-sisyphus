import React, { type FC, useMemo } from 'react';

import AddLogo from '../assets/icons/add.svg?react';
import EditLogo from '../assets/icons/edit.svg?react';
import CheckLogo from '../assets/icons/check.svg?react';
import DeleteLogo from '../assets/icons/delete.svg?react';

import { classTrim } from '../utils';

import './aicon.scss';

type typeIcons = 'add' | 'edit' | 'check' | 'delete';

interface IAicon {
  /** The size of the icon */
  size?: 'small' | 'medium'
  /** The type of icon */
  type: typeIcons
  /** The class of the Icon element */
  className?: string
  /** When the icon is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

const Aicon: FC<IAicon> = ({
  type,
  size = 'medium',
  className,
  onClick
}) => {
  const classes = useMemo<string>(() => classTrim(`
    aicon
    aicon--${size}
    ${className ?? ''}
  `), [className, size]);

  const icoDom = useMemo(() => {
    switch (type) {
      case 'add': return <AddLogo className={classes} />;
      case 'edit': return <EditLogo className={classes} />;
      case 'check': return <CheckLogo className={classes} />;
      default: return <DeleteLogo className={classes} />;
    }
  }, [type, classes]);

  return icoDom;
};

export { Aicon, type IAicon, type typeIcons };
