import React from 'react';
import type { FC } from 'react';

import {
  Quark, type IQuarkProps
} from '../quark';

import { classTrim } from '../utils';

import './atextarea.scss';

interface IAtextarea {
  /** The type of input */
  type?: 'text' | 'password' | 'email' | 'number' | 'textarea'
  /** The size of the input */
  size?: 'medium' | 'small'
  /** The placeholder of the Textarea element */
  placeholder?: string
  /** The value of the Textarea element */
  value: string
  /** Is the field editable */
  readOnly?: boolean
  /** Is the field hidden */
  hidden?: boolean
  /** Allow the user's password manager to automatically enter the password */
  autoComplete?: string
  /** When the field changes */
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const Atextarea: FC<IQuarkProps<IAtextarea>> = ({
  hidden,
  size = 'medium',
  type = 'text',
  className,
  value,
  placeholder,
  onChange,
  autoComplete,
  onFocus,
  onBlur,
  readOnly
}) => (
  <Quark
    quarkType="textarea"
    readOnly={readOnly}
    onChange={onChange}
    hidden={hidden}
    placeholder={placeholder}
    autoComplete={autoComplete}
    onFocus={onFocus}
    onBlur={onBlur}
    className={classTrim(`
        atextarea
        atextarea--${size}
        atextarea--${type}
        ${readOnly === true ? 'atextarea--readonly' : ''}
        ${className ?? ''}
      `)}
    value={value}
  />
);

export default Atextarea;
