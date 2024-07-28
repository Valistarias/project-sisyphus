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
  /** When the field changes */
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const Ainput: FC<IAinput> = ({
  className,
  hidden,
  id,
  inline = false,
  onChange,
  placeholder,
  readOnly,
  size = 'medium',
  type = 'text',
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
    type={type}
    hidden={hidden}
    id={id}
    name={id}
    readOnly={readOnly}
    onChange={onChange}
    placeholder={placeholder}
    value={value}
  />
);

export default Ainput;
