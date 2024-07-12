import React, { type FC, type ReactNode } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './abutton.scss';

interface IAButton extends IQuarkProps {
  /** When the button is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** The childrens of the button element */
  children?: ReactNode;
  /** The type of the Button element */
  type?: 'button' | 'submit';
  /** Is the button disabled ? */
  disabled?: boolean;
  /** When the button is right clicked */
  onContextMenu?: (e: React.MouseEvent<HTMLElement>) => void;
}

const Abutton: FC<IAButton> = ({
  className,
  children,
  onClick,
  type,
  disabled,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
}) => (
  <Quark
    quarkType="button"
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={classTrim(`
        abutton
        ${className ?? ''}
      `)}
    type={type}
    disabled={disabled}
    onContextMenu={onContextMenu}
  >
    {children}
  </Quark>
);

export { Abutton, type IAButton };
