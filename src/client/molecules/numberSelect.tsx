import React, { type FC } from 'react';

import { Controller } from 'react-hook-form';

import { Aerror, Ap } from '../atoms';
import { Quark, type IQuarkProps } from '../quark';

import Button from './button';

import type { IReactHookFormInputs } from '../types';

import { classTrim } from '../utils';

import './numberSelect.scss';

interface INumberSelect extends IReactHookFormInputs {
  /** The theme of the number select */
  theme?: 'vertical' | 'horizontal';
  /** The minimim value the stat can go */
  minimum?: number;
  /** The maximum value the stat can go */
  maximum?: number;
  /** Can you add more value (got the priority over maximum prop) */
  maxed?: boolean;
  /** The offset of the indicated value */
  offset?: number;
}

const NumberSelect: FC<IQuarkProps<INumberSelect>> = ({
  className,
  inputName,
  rules,
  control,
  minimum = 0,
  maximum,
  offset = 0,
  maxed = false,
  theme = 'vertical',
}) => (
  <Quark
    quarkType="div"
    className={classTrim(`
        number-select
        number-select--${theme}
        ${className ?? ''}
      `)}
  >
    <Controller
      control={control}
      name={inputName}
      rules={rules}
      render={({ field: { onChange, value, name }, fieldState: { error } }) => (
        <>
          <Button
            className={classTrim(`
                number-select__btn-plus
                ${(maximum !== undefined && value + offset >= maximum) || maxed ? 'number-select__btn-plus--hide' : ''}
              `)}
            icon="Arrow"
            theme="text-only"
            size={theme === 'vertical' ? 'medium' : 'small'}
            onClick={() => {
              onChange(value + 1);
            }}
          />
          <Ap className="number-select__value">{value + offset}</Ap>
          <Button
            className={classTrim(`
                number-select__btn-minus
                ${value <= minimum ? 'number-select__btn-minus--hide' : ''}
              `)}
            icon="Arrow"
            theme="text-only"
            size={theme === 'vertical' ? 'medium' : 'small'}
            onClick={() => {
              onChange(value - 1);
            }}
          />
          {error?.message !== undefined ? (
            <Aerror className="nodeiconselect__error">{error.message}</Aerror>
          ) : null}
        </>
      )}
    />
  </Quark>
);

export default NumberSelect;
