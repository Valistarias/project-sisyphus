import React, { type FC } from 'react';

import { useNavigate, type NavigateFunction } from 'react-router-dom';

import { Abutton, Aicon, type IAButton, type typeIcons } from '../atoms';

import { classTrim } from '../utils';

import './button.scss';

export type IButton = IAButton & {
  /** The theme of the button */
  theme?: 'solid' | 'line' | 'afterglow' | 'text-only' | 'bland';
  /** The main color of the button */
  color?: 'primary' | 'secondary' | 'tertiary' | 'error';
  /** The size of the button */
  size?: 'xlarge' | 'large' | 'medium' | 'small';
  /** The redirect (if there is) on a button click */
  href?: string;
  /** Similar to disabled, but without the opacity */
  unclickable?: boolean;
  /** Is the button activated by any means ? */
  active?: boolean;
} & (
    | {
        /** The icon of the button */
        icon: typeIcons;
        /** The children (if any) of the button */
        children?: IAButton['children'];
      }
    | {
        /** The icon (if any) of the button */
        icon?: typeIcons;
        /** The children of the button */
        children: IAButton['children'];
      }
  );

const Button: FC<IButton> = ({
  type = 'button',
  theme = 'solid',
  color = 'primary',
  size = 'medium',
  disabled = false,
  unclickable = false,
  active = false,
  href = null,
  className,
  children,
  icon,
  onClick,
  onContextMenu,
  onMouseEnter,
  onMouseLeave,
}) => {
  let navigate: NavigateFunction | null = null;
  if (href !== null) {
    navigate = useNavigate();
  }

  return (
    <Abutton
      className={classTrim(`
        button
        button--${theme}
        button--${size}
        button--${color}
        ${icon === undefined ? 'button--noicon' : ''}
        ${children === undefined ? 'button--notext' : ''}
        ${disabled ? 'button--disabled' : ''}
        ${unclickable ? 'button--unclickable' : ''}
        ${active ? 'button--active' : ''}
        ${className ?? ''}
      `)}
      onClick={(e: React.MouseEvent<HTMLElement>) => {
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
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children !== undefined ? <span className="button__content">{children}</span> : null}
      {icon !== undefined ? <Aicon className="button__icon" type={icon} /> : null}
    </Abutton>
  );
};

export default Button;
