import React, { type FC, type MouseEvent } from 'react';

import { Controller } from 'react-hook-form';

import { Ainput, Alabel } from '../atoms';

import type { IReactHookFormInputs } from '../types';

import './numDisplayInput.scss';

interface INumDisplayInput extends IReactHookFormInputs {
  /** The label of the DisplayInput */
  text: string;
  /** The stat element, if there is stat bonuses */
  fixedValue: number;
  /** When the user select elsewhere of the input */
  onBlur?: (val: MouseEvent) => void;
}

const NumDisplayInput: FC<INumDisplayInput> = ({
  text,
  onBlur,
  fixedValue,
  control,
  inputName,
  rules,
}) => (
  <div className="num-display-input">
    <Controller
      control={control}
      name={inputName}
      rules={rules}
      render={({
        field: { onChange, onBlur: onControllerBlur, value, name, ref },
        fieldState: { error },
      }) => (
        <>
          <Alabel className="num-display-input__title" htmlFor={inputName}>
            {text}
          </Alabel>
          <div className="num-display-input__content">
            <Ainput
              className="num-display-input__content__field"
              onChange={onChange}
              value={value ?? ''}
              type="number"
              // onFocus={() => {
              //   setFocus(true);
              // }}
              onBlur={(e) => {
                // setFocus(false);
                onControllerBlur();
                if (onBlur !== undefined) {
                  onBlur(e);
                }
              }}
            />
            <span className="num-display-input__content__slash">/</span>
            <span className="num-display-input__content__total">{fixedValue}</span>
          </div>

          <div className="num-display-input__bg" />
        </>
      )}
    />
  </div>
);

export default NumDisplayInput;
