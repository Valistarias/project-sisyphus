import React, { type FC } from 'react';

import { classTrim } from '../utils';

import { type ChangeHandler } from 'react-hook-form';

import { Alabel } from '../atoms';

import './input.scss';

interface IInput {
  /** The controlled element for react hook form */
  registered?: {
    onChange: ChangeHandler
    onBlur: ChangeHandler
    ref: React.Ref<any>
    name: string
  }
  /** The type of input */
  type?: 'text' | 'password' | 'email'
  /** The theme of the button */
  theme?: 'primary' | 'secondary' | 'tertiary'
  /** The size of the input */
  size?: 'medium' | 'small'
  /** The class of the Textarea element */
  className?: string
  /** The placeholder of the Textarea element */
  placeholder?: string
  /** The label, if any */
  label?: string
  /** Is the field editable */
  readOnly?: boolean
  /** Is the field hidden */
  hidden?: boolean
  /** Allow the user's password manager to automatically enter the password */
  autoComplete?: string
  /** On field change */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  /** The field value */
  value?: string
}

const Input: FC<IInput> = ({
  registered,
  type = 'text',
  theme = 'primary',
  size = 'medium',
  className,
  placeholder,
  label,
  readOnly,
  hidden,
  autoComplete,
  onChange,
  value
}) => (
  <div className={
    classTrim(`
      input
      input--${theme}
      input--${size}
      ${readOnly === true ? 'input--readonly' : ''}
      ${className ?? ''}
    `)
  }>
    {label !== undefined
      ? (
      <Alabel
        htmlFor={registered?.name}
      >
        {label}
      </Alabel>
        )
      : null}
    <input
      type={type}
      readOnly={readOnly}
      hidden={hidden}
      placeholder={placeholder}
      className="input__field"
      autoComplete={autoComplete ?? undefined}
      onChange={onChange}
      value={value}
      { ...registered }
    />
  </div>
);

export default Input;
