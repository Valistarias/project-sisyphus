import React, { type FC } from 'react';

import { Aicon, type typeIcons } from '../atoms/aicon';

import { classTrim } from '../utils';

import './button.scss';

interface IButton {
  /** The type of the Button element */
  type?: 'button' | 'submit'
  /** The theme of the button */
  theme?: 'primary' | 'secondary' | 'tertiary'
  /** The size of the button */
  size?: 'medium' | 'small'
  /** The class of the Button element */
  className?: string
  /** The text inside the button */
  children?: string
  /** The icon (if any) of the button */
  icon?: typeIcons
  /** When the input is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

const Button: FC<IButton> = ({
  type = 'button',
  theme = 'primary',
  size = 'medium',
  className,
  children,
  icon,
  onClick
}) => (
  <button
    className={
      classTrim(`
        button
        button--${theme}
        button--${size}
        ${icon === undefined ? 'button--noicon' : ''}
        ${children === undefined ? 'button--notext' : ''}
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
    {
      children !== undefined
        ? (
        <span className="button__content">{children}</span>
          )
        : null
    }
    {icon !== undefined ? (<Aicon className="button__icon" type={icon} />) : null}
  </button>
);

export default Button;
