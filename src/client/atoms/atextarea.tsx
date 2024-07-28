import React, { type FC } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './atextarea.scss';

interface IAtextarea extends IQuarkProps {
  /** The type of input */
  type?: 'text' | 'password' | 'email' | 'number' | 'textarea';
  /** The size of the input */
  size?: 'medium' | 'small';
  /** The placeholder of the Textarea element */
  placeholder?: string;
  /** The value of the Textarea element */
  value: string;
  /** Is the field editable */
  readOnly?: boolean;
  /** When the field changes */
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const Atextarea: FC<IAtextarea> = ({
  id,
  size = 'medium',
  type = 'text',
  className,
  value,
  placeholder,
  onChange,
  readOnly,
}) => (
  <Quark
    quarkType="textarea"
    id={id}
    name={id}
    readOnly={readOnly}
    onChange={onChange}
    placeholder={placeholder}
    className={classTrim(`
        atextarea
        atextarea--${size}
        atextarea--${type}
        ${readOnly === true ? 'atextarea--readonly' : ''}
        ${className ?? ''}
      `)}
    value={value}
  />
);

export default Atextarea;
