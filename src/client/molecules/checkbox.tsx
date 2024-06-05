import React, { type FC, type ReactNode } from 'react';

import { Controller } from 'react-hook-form';

import { Aerror, Aicon, Alabel } from '../atoms';
import { type IReactHookFormInputs } from '../types/form';

import { classTrim } from '../utils';

import './checkbox.scss';

interface ICheckbox extends IReactHookFormInputs {
  /** The size of the checkbox */
  size?: 'medium' | 'small';
  /** The class of the checkbox element */
  className?: string;
  /** The label, if any */
  label: ReactNode;
  /** Allow the user's password manager to automatically enter the password */
  autoComplete?: string;
  /** Is the checkbox disabled ? */
  disabled?: boolean;
}

const Checkbox: FC<ICheckbox> = ({
  control,
  inputName,
  rules,
  size = 'medium',
  className,
  label,
  autoComplete,
  disabled = false,
}) => (
  <div
    className={classTrim(`
      checkbox
      checkbox--${size}
      ${disabled ? 'checkbox--disabled' : ''}
      ${className ?? ''}
    `)}
  >
    <Controller
      control={control}
      name={inputName}
      rules={rules}
      render={({ field: { onChange, onBlur, value, name, ref }, fieldState: { error } }) => (
        <>
          <Alabel className="checkbox__block">
            <div
              className={classTrim(`
              checkbox__field
              ${value === true ? 'checkbox__field--checked' : ''}
            `)}
            >
              {value === true ? (
                <Aicon type="check" size="small" className="checkbox__field__icon" />
              ) : null}
            </div>
            <input
              type="checkbox"
              className="checkbox__leg-field"
              autoComplete={autoComplete ?? undefined}
              onChange={disabled ? undefined : onChange}
              value={value ?? ''}
            />
            <div className="checkbox__label">{label}</div>
          </Alabel>
          {error?.message !== undefined ? (
            <Aerror className="checkbox__error">{error.message}</Aerror>
          ) : null}
        </>
      )}
    />
  </div>
);

export default Checkbox;
