import React, { type FC, useCallback, useMemo } from 'react';

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
  const classes = useMemo(() => classTrim(`
    aicon
    aicon--${size}
    ${className ?? ''}
  `), [className]);

  const onClickEvt = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (onClick === undefined) { return; }
    e.stopPropagation();
    onClick(e);
  }, []);

  const icoDom = useMemo(() => {
    switch (type) {
      case 'add': return <AddLogo className={classes} onClick={onClickEvt} />;
      case 'edit': return <EditLogo className={classes} onClick={onClickEvt} />;
      case 'check': return <CheckLogo className={classes} onClick={onClickEvt} />;
      default: return <DeleteLogo className={classes} onClick={onClickEvt} />;
    }
  }, [type, classes]);

  return icoDom;
};

export { Aicon, type IAicon, type typeIcons };
