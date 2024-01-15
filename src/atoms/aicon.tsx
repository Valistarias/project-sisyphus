import React, { useMemo, type FC } from 'react';

import AddLogo from '../assets/icons/add.svg?react';
import CheckLogo from '../assets/icons/check.svg?react';
import DeleteLogo from '../assets/icons/delete.svg?react';
import DiscordLogo from '../assets/icons/discord.svg?react';
import EditLogo from '../assets/icons/edit.svg?react';
import MainLogo from '../assets/icons/logo.svg?react';
import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './aicon.scss';

type typeIcons = 'add' | 'edit' | 'check' | 'delete' | 'discord' | 'main';

interface IAicon extends IQuarkProps {
  /** The size of the icon */
  size?: 'small' | 'medium';
  /** The type of icon */
  type: typeIcons;
  /** When the icon is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

const Aicon: FC<IAicon> = ({ type, size = 'medium', className, onClick }) => {
  const classes = useMemo<string>(
    () =>
      classTrim(`
    aicon
    aicon--${size}
    ${className ?? ''}
  `),
    [className, size]
  );

  const icoDom = useMemo(() => {
    switch (type) {
      case 'add':
        return <Quark quarkType={AddLogo} className={classes} />;
      case 'edit':
        return <Quark quarkType={EditLogo} className={classes} />;
      case 'discord':
        return <Quark quarkType={DiscordLogo} className={classes} />;
      case 'main':
        return <Quark quarkType={MainLogo} className={classes} />;
      case 'check':
        return <Quark quarkType={CheckLogo} className={classes} />;
      default:
        return <Quark quarkType={DeleteLogo} className={classes} />;
    }
  }, [type, classes]);

  return icoDom;
};

export { Aicon, type IAicon, type typeIcons };
