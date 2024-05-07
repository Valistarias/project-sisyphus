import React, { type FC } from 'react';

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
  label: string;
  /** Allow the user's password manager to automatically enter the password */
  autoComplete?: string;
}

const Checkbox: FC<ICheckbox> = ({
  control,
  inputName,
  rules,
  size = 'medium',
  className,
  label,
  autoComplete,
}) => (
  <div
    className={classTrim(`
      checkbox
      checkbox--${size}
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
              onChange={onChange}
              value={value ?? ''}
            />
            <span className="checkbox__label">{label}</span>
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