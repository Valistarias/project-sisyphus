import React, { type FC } from 'react';

import { Controller } from 'react-hook-form';

import { Aerror, Ap } from '../atoms';
import { Quark, type IQuarkProps } from '../quark';
import { type IReactHookFormInputs } from '../types';

import Button from './button';

import { classTrim } from '../utils';

import './numberSelect.scss';

interface INumberSelect extends IQuarkProps, IReactHookFormInputs {
  /** The minimim value the stat can go */
  minimum?: number;
  /** The maximum value the stat can go */
  maximum?: number;
}

const NumberSelect: FC<INumberSelect> = ({
  className,
  inputName,
  rules,
  control,
  minimum = 0,
  maximum,
}) => {
  return (
    <Quark
      quarkType="div"
      className={classTrim(`
        number-select
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
                ${maximum !== undefined && value >= minimum ? 'number-select__btn-plus--hide' : ''}
              `)}
              icon="arrow"
              theme="text-only"
              onClick={() => {
                onChange(value + 1);
              }}
            />
            <Ap className="number-select__value">{value}</Ap>
            <Button
              className={classTrim(`
                number-select__btn-minus
                ${value <= minimum ? 'number-select__btn-minus--hide' : ''}
              `)}
              icon="arrow"
              theme="text-only"
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
};

export default NumberSelect;
