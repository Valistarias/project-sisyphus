import React, { type FC } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './ainput.scss';

interface IAinput extends IQuarkProps {
  /** The type of input */
  type?: 'text' | 'password' | 'email' | 'number' | 'textarea';
  /** The size of the input */
  size?: 'medium' | 'small';
  /** Is the input inline ? */
  inline?: boolean;
  /** The placeholder of the input element */
  placeholder?: string;
  /** The value of the input element */
  value: string;
  /** Is the field hidden */
  hidden?: boolean;
  /** Is the field editable */
  readOnly?: boolean;
  /** Allow the user's password manager to automatically enter the password */
  autoComplete?: string;
  /** When the field changes */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Ainput: FC<IAinput> = ({
  className,
  hidden,
  inline = false,
  onChange,
  placeholder,
  readOnly,
  autoComplete,
  size = 'medium',
  type = 'text',
  onFocus,
  onBlur,
  value,
}) => (
  <Quark
    quarkType="input"
    className={classTrim(`
    ainput
    ainput--${size}
    ainput--${type}
    ${readOnly === true ? 'ainput--readonly' : ''}
    ${inline ? 'ainput--inline' : ''}
    ${className ?? ''}
  `)}
    autoComplete={autoComplete}
    hidden={hidden}
    onChange={onChange}
    placeholder={placeholder}
    readOnly={readOnly}
    onFocus={onFocus}
    onBlur={onBlur}
    type={type}
    value={value}
  />
);

export default Ainput;
