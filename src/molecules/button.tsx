import React, { type FC } from 'react';

import { useNavigate, type NavigateFunction } from 'react-router-dom';

import { Aicon, type typeIcons } from '../atoms/aicon';
import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './button.scss';

interface IButton extends IQuarkProps {
  /** The type of the Button element */
  type?: 'button' | 'submit';
  /** The theme of the button */
  theme?: 'solid' | 'afterglow' | 'text-only' | 'bland';
  /** The main color of the button */
  color?: 'primary' | 'secondary' | 'tertiary' | 'error';
  /** The size of the button */
  size?: 'xlarge' | 'large' | 'medium' | 'small';
  /** The text inside the button */
  children?: React.JSX.Element | string | string[] | Array<string | React.JSX.Element>;
  /** The icon (if any) of the button */
  icon?: typeIcons;
  /** The redirect (if there is) on a button click */
  href?: string;
  /** Is the button disabled ? */
  disabled?: boolean;
  /** Is the button activated by any means ? */
  active?: boolean;
  /** When the input is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

const Button: FC<IButton> = ({
  type = 'button',
  theme = 'solid',
  color = 'primary',
  size = 'medium',
  disabled = false,
  active = false,
  href = null,
  className,
  children,
  icon,
  onClick,
}) => {
  let navigate: NavigateFunction | null = null;
  if (href !== null) {
    navigate = useNavigate();
  }

  return (
    <Quark
      quarkType="button"
      className={classTrim(`
        button
        button--${theme}
        button--${size}
        button--${color}
        ${icon === undefined ? 'button--noicon' : ''}
        ${children === undefined ? 'button--notext' : ''}
        ${disabled ? 'button--disabled' : ''}
        ${active ? 'button--active' : ''}
        ${className ?? ''}
      `)}
      onClick={(e) => {
        e.stopPropagation();
        if (href !== null && navigate !== null) {
          navigate(href);
        }
        if (onClick !== undefined) {
          onClick(e);
        }
      }}
      type={type}
      disabled={disabled}
    >
      {children !== undefined ? <span className="button__content">{children}</span> : null}
      {icon !== undefined ? <Aicon className="button__icon" type={icon} /> : null}
    </Quark>
  );
};

export default Button;
