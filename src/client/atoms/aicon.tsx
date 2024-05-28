import React, { useMemo, type FC } from 'react';

import AddLogo from '../assets/icons/add.svg?react';
import ArrowLogo from '../assets/icons/arrow.svg?react';
import CheckLogo from '../assets/icons/check.svg?react';
import CrossLogo from '../assets/icons/cross.svg?react';
import D10Logo from '../assets/icons/d10.svg?react';
import D12Logo from '../assets/icons/d12.svg?react';
import D20Logo from '../assets/icons/d20.svg?react';
import D4Logo from '../assets/icons/d4.svg?react';
import D6Logo from '../assets/icons/d6.svg?react';
import D8Logo from '../assets/icons/d8.svg?react';
import DeleteLogo from '../assets/icons/delete.svg?react';
import DiscordLogo from '../assets/icons/discord.svg?react';
import EditLogo from '../assets/icons/edit.svg?react';
import EidolonLogo from '../assets/icons/eidolon.svg?react';
import MainLogo from '../assets/icons/logo.svg?react';
import MinusLogo from '../assets/icons/minus.svg?react';
import QuestionLogo from '../assets/icons/question.svg?react';
import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './aicon.scss';

type typeIcons =
  | 'add'
  | 'minus'
  | 'edit'
  | 'arrow'
  | 'check'
  | 'cross'
  | 'question'
  | 'delete'
  | 'discord'
  | 'main'
  | 'eidolon'
  | 'd20'
  | 'd12'
  | 'd10'
  | 'd8'
  | 'd6'
  | 'd4';

interface IAicon extends IQuarkProps {
  /** The size of the icon */
  size?: 'small' | 'medium' | 'large' | 'unsized';
  /** The type of icon */
  type: typeIcons;
  /** When the icon is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

const Aicon: FC<IAicon> = ({
  type,
  size = 'medium',
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const classes = useMemo<string>(
    () =>
      classTrim(`
    aicon
    aicon--${size}
    ${className ?? ''}
  `),
    [className, size]
  );

  const params = useMemo(
    () => ({
      onClick,
      onMouseEnter,
      onMouseLeave,
    }),
    [onClick, onMouseEnter, onMouseLeave]
  );

  const icoDom = useMemo(() => {
    switch (type) {
      case 'add':
        return <Quark quarkType={AddLogo} className={classes} {...params} />;
      case 'minus':
        return <Quark quarkType={MinusLogo} className={classes} {...params} />;
      case 'arrow':
        return <Quark quarkType={ArrowLogo} className={classes} {...params} />;
      case 'edit':
        return <Quark quarkType={EditLogo} className={classes} {...params} />;
      case 'discord':
        return <Quark quarkType={DiscordLogo} className={classes} {...params} />;
      case 'main':
        return <Quark quarkType={MainLogo} className={classes} {...params} />;
      case 'eidolon':
        return <Quark quarkType={EidolonLogo} className={classes} {...params} />;
      case 'check':
        return <Quark quarkType={CheckLogo} className={classes} {...params} />;
      case 'cross':
        return <Quark quarkType={CrossLogo} className={classes} {...params} />;
      case 'question':
        return <Quark quarkType={QuestionLogo} className={classes} {...params} />;
      case 'd20':
        return <Quark quarkType={D20Logo} className={classes} {...params} />;
      case 'd12':
        return <Quark quarkType={D12Logo} className={classes} {...params} />;
      case 'd10':
        return <Quark quarkType={D10Logo} className={classes} {...params} />;
      case 'd8':
        return <Quark quarkType={D8Logo} className={classes} {...params} />;
      case 'd6':
        return <Quark quarkType={D6Logo} className={classes} {...params} />;
      case 'd4':
        return <Quark quarkType={D4Logo} className={classes} {...params} />;
      default:
        return <Quark quarkType={DeleteLogo} className={classes} {...params} />;
    }
  }, [type, classes, params]);

  return icoDom;
};

export { Aicon, type IAicon, type typeIcons };
