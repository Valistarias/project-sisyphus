import React from 'react';
import type { FC } from 'react';

import {
  Abutton, Aicon, type IAButton, type typeIcons
} from '../atoms';

import type { IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './button.scss';

export type IButton = IQuarkProps<IAButton> & {
  /** The theme of the button */
  theme?: 'solid' | 'line' | 'line-alt' | 'afterglow' | 'text-only' | 'text-only-alt' | 'bland'
  /** The main color of the button */
  color?: 'primary' | 'secondary' | 'tertiary' | 'error'
  /** The size of the button */
  size?: 'xlarge' | 'large' | 'medium' | 'small'
  /** Similar to disabled, but without the opacity */
  unclickable?: boolean
  /** Is the button activated by any means ? */
  active?: boolean
} & (
  | {
    /** The icon of the button */
    icon: typeIcons
    /** The children (if any) of the button */
    children?: IAButton['children']
  }
  | {
    /** The icon (if any) of the button */
    icon?: typeIcons
    /** The children of the button */
    children: IAButton['children']
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
  className,
  children,
  icon,
  onClick,
  onContextMenu,
  onMouseEnter,
  onMouseLeave
}) => (
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

export default Button;
