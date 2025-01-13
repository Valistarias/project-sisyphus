import type React from 'react';
import { useMemo, type FC } from 'react';

import Add from '../assets/icons/add.svg?react';
import Arrow from '../assets/icons/arrow.svg?react';
import Check from '../assets/icons/check.svg?react';
import Cross from '../assets/icons/cross.svg?react';
import D10 from '../assets/icons/d10.svg?react';
import D12 from '../assets/icons/d12.svg?react';
import D20 from '../assets/icons/d20.svg?react';
import D4 from '../assets/icons/d4.svg?react';
import D6 from '../assets/icons/d6.svg?react';
import D8 from '../assets/icons/d8.svg?react';
import Delete from '../assets/icons/delete.svg?react';
import Discord from '../assets/icons/discord.svg?react';
import Edit from '../assets/icons/edit.svg?react';
import Eidolon from '../assets/icons/eidolon.svg?react';
import Main from '../assets/icons/logo.svg?react';
import Minus from '../assets/icons/minus.svg?react';
import Question from '../assets/icons/question.svg?react';
import Search from '../assets/icons/search.svg?react';
import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './aicon.scss';

const icons = {
  Add,
  Arrow,
  Check,
  Cross,
  D10,
  D12,
  D20,
  D4,
  D6,
  D8,
  Delete,
  Discord,
  Edit,
  Eidolon,
  Main,
  Minus,
  Question,
  Search,
};

type typeIcons = keyof typeof icons;

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
  const params = useMemo(
    () => ({
      onClick,
      onMouseEnter,
      onMouseLeave,
    }),
    [onClick, onMouseEnter, onMouseLeave]
  );

  return (
    <Quark
      quarkType={icons[type]}
      className={classTrim(`
      aicon
      aicon--${size}
      ${className ?? ''}
    `)}
      {...params}
    />
  );
};

export { Aicon, type IAicon, type typeIcons };
