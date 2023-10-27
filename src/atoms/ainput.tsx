import React, { type FC } from 'react';

import { classTrim } from '../utils';

import { type ChangeHandler } from 'react-hook-form';

import './ainput.scss';

interface IAinput {
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
  /** The class of the Textarea element */
  className?: string
  /** The placeholder of the Textarea element */
  placeholder?: string
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

const Ainput: FC<IAinput> = ({
  registered,
  type = 'text',
  theme = 'primary',
  className,
  placeholder,
  readOnly,
  hidden,
  autoComplete,
  onChange,
  value
}) => (
  <input
    type={type}
    readOnly={readOnly}
    hidden={hidden}
    placeholder={placeholder}
    className={
      classTrim(`
        ainput
        ainput--${theme}
        ${readOnly === true ? 'ainput--readonly' : ''}
        ${className ?? ''}
      `)
    }
    autoComplete={autoComplete ?? undefined}
    onChange={onChange}
    value={value}
    { ...registered }
  />
);

export default Ainput;
