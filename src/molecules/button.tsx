import React, { type FC } from 'react';

import { type NavigateFunction, useNavigate } from 'react-router-dom';

import { Aicon, type typeIcons } from '../atoms/aicon';

import { classTrim } from '../utils';

import './button.scss';

interface IButton {
  /** The type of the Button element */
  type?: 'button' | 'submit'
  /** The theme of the button */
  theme?: 'primary' | 'secondary' | 'tertiary' | 'error'
  /** The size of the button */
  size?: 'medium' | 'small'
  /** The class of the Button element */
  className?: string
  /** The text inside the button */
  children?: string
  /** The icon (if any) of the button */
  icon?: typeIcons
  /** The redirect (if there is) on a button click */
  href?: string
  /** Is the button disabled ? */
  disabled?: boolean
  /** Is the button activated by any means ? */
  active?: boolean
  /** When the input is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

const Button: FC<IButton> = ({
  type = 'button',
  theme = 'primary',
  size = 'medium',
  disabled = false,
  active = false,
  href = null,
  className,
  children,
  icon,
  onClick
}) => {
  let navigate: NavigateFunction | null = null;
  if (href !== null) {
    navigate = useNavigate();
  }

  return (
  <button
    className={
      classTrim(`
        button
        button--${theme}
        button--${size}
        ${icon === undefined ? 'button--noicon' : ''}
        ${children === undefined ? 'button--notext' : ''}
        ${disabled ? 'button--disabled' : ''}
        ${active ? 'button--active' : ''}
        ${className ?? ''}
      `)
    }
    onClick={(e) => {
      e.stopPropagation();
      if (href !== null && navigate !== null) {
        navigate(href);
      } else if (onClick !== undefined) {
        onClick(e);
      }
    }}
    type={type}
    disabled={disabled}
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
};

export default Button;
