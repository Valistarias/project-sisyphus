import React, { type FC } from 'react';

import { Aicon, type typeIcons } from '../atoms/aicon';

import { classTrim } from '../utils';

import './button.scss';

interface ButtonProps {
  /** The type of the Button element */
  type?: 'button' | 'submit'
  /** The class of the Button element */
  className?: string
  /** The text inside the button */
  children: string
  /** The icon (if any) of the button */
  icon?: typeIcons
  /** When the input is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

const Button: FC<ButtonProps> = ({
  type = 'button',
  className,
  children,
  icon,
  onClick
}) => (
  <button
    className={
      classTrim(`
        button
        ${className ?? ''}
      `)
    }
    onClick={(e) => {
      if (onClick !== undefined) {
        e.stopPropagation();
        onClick(e);
      }
    }}
    type={type}
  >
    <span className="button__content">{children}</span>
    {icon !== undefined ? (<Aicon className="button__icon" type={icon} />) : null}
  </button>
);

export default Button;
