import React, {
  type ChangeEvent,
  useState, type FC
} from 'react';

import { Controller } from 'react-hook-form';

import {
  Aerror,
  Ainput,
  Alabel,
  Atextarea
} from '../atoms';

import type { IReactHookFormInputs } from '../types/form';

import { classTrim } from '../utils';

import './input.scss';

interface IInput extends IReactHookFormInputs {
  /** The type of input */
  type?: 'text' | 'password' | 'email' | 'number' | 'textarea'
  /** The size of the input */
  size?: 'medium' | 'small'
  /** Is the input inline ? */
  inline?: boolean
  /** The class of the Textarea element */
  className?: string
  /** The placeholder of the Textarea element */
  placeholder?: string
  /** The label, if any */
  label?: string
  /** Is the field editable */
  readOnly?: boolean
  /** Triggered when the selected field is changing */
  onChange?: (val: ChangeEvent<HTMLTextAreaElement>) => void
  /** Is the field hidden */
  hidden?: boolean
  /** Allow the user's password manager to automatically enter the password */
  autoComplete?: string
  /** When the user select elsewhere of the input */
  onBlur?: () => void
}

const Input: FC<IInput> = ({
  control,
  inputName,
  inline = false,
  rules,
  type = 'text',
  size = 'medium',
  onChange: exteriorChange,
  className,
  placeholder,
  label,
  readOnly,
  hidden,
  autoComplete,
  onBlur
}) => {
  const [isFocus, setFocus] = useState(false);

  return (
    <div
      className={classTrim(`
      input
      ${isFocus ? 'input--focus' : ''}
      ${className ?? ''}
    `)}
    >
      <Controller
        control={control}
        name={inputName}
        rules={rules}
        render={({
          field: {
            onChange, onBlur: onControllerBlur, value, name, ref
          },
          fieldState: { error }
        }) => (
          <>
            {label !== undefined
              ? (
                  <Alabel className="input__label" htmlFor={name}>
                    {label}
                  </Alabel>
                )
              : null}
            <div className="input__decor">
              {type === 'textarea'
                ? (
                    <Atextarea
                      readOnly={readOnly}
                      size={size}
                      hidden={hidden}
                      placeholder={placeholder}
                      className="input__field"
                      autoComplete={autoComplete ?? undefined}
                      onChange={(e) => {
                        onChange(e);
                        if (exteriorChange !== undefined) {
                          exteriorChange(e);
                        }
                      }}
                      value={value ?? ''}
                      onFocus={() => {
                        setFocus(true);
                      }}
                      onBlur={(e) => {
                        setFocus(false);
                        onControllerBlur();
                        if (onBlur !== undefined) {
                          onBlur();
                        }
                      }}
                    />
                  )
                : (
                    <Ainput
                      type={type}
                      size={size}
                      inline={inline}
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
                        onControllerBlur();
                        if (onBlur !== undefined) {
                          onBlur();
                        }
                      }}
                    />
                  )}
            </div>
            {error?.message !== undefined
              ? (
                  <Aerror className="input__error">{error.message}</Aerror>
                )
              : null}
          </>
        )}
      />
    </div>
  );
};

export default Input;
