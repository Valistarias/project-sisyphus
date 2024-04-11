import React, { useState, type FC } from 'react';

import { Controller } from 'react-hook-form';

import { Aerror, Alabel } from '../atoms';
import { type IReactHookFormInputs } from '../types/form';

import { classTrim } from '../utils';

import './input.scss';

interface IInput extends IReactHookFormInputs {
  /** The type of input */
  type?: 'text' | 'password' | 'email' | 'number';
  /** The size of the input */
  size?: 'medium' | 'small';
  /** The class of the Textarea element */
  className?: string;
  /** The placeholder of the Textarea element */
  placeholder?: string;
  /** The label, if any */
  label?: string;
  /** Is the field editable */
  readOnly?: boolean;
  /** Is the field hidden */
  hidden?: boolean;
  /** Allow the user's password manager to automatically enter the password */
  autoComplete?: string;
}

const Input: FC<IInput> = ({
  control,
  inputName,
  rules,
  type = 'text',
  size = 'medium',
  className,
  placeholder,
  label,
  readOnly,
  hidden,
  autoComplete,
}) => {
  const [isFocus, setFocus] = useState(false);
  return (
    <div
      className={classTrim(`
      input
      input--${size}
      ${readOnly === true ? 'input--readonly' : ''}
      ${isFocus ? 'input--focus' : ''}
      ${className ?? ''}
    `)}
    >
      <Controller
        control={control}
        name={inputName}
        rules={rules}
        render={({ field: { onChange, onBlur, value, name, ref }, fieldState: { error } }) => (
          <>
            {label !== undefined ? (
              <Alabel className="input__label" htmlFor={name}>
                {label}
              </Alabel>
            ) : null}
            <div className="input__decor">
              <input
                type={type}
                readOnly={readOnly}
                hidden={hidden}
                placeholder={placeholder}
                className="input__field"
                autoComplete={autoComplete ?? undefined}
                onChange={onChange}
                value={value ?? ''}
                onFocus={() => {
                  setFocus(true);
                }}
                onBlur={(e) => {
                  setFocus(false);
                  onBlur();
                }}
              />
            </div>
            {error?.message !== undefined ? (
              <Aerror className="input__error">{error.message}</Aerror>
            ) : null}
          </>
        )}
      />
    </div>
  );
};

export default Input;
