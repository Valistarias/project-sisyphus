import React, { type FC } from 'react';

import { classTrim } from '../utils';

import './ainput.scss';

interface IAinput {
  /** The id of the Textarea element */
  id: string
  /** The type of input */
  type?: 'text'
  /** The class of the Textarea element */
  className?: string
  /** The placeholder of the Textarea element */
  placeholder?: string
  /** The value of the Textarea element */
  value: string
  /** Is the field editable */
  readOnly?: boolean
  /** When the field changes */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Ainput: FC<IAinput> = ({
  id,
  type = 'text',
  className,
  value,
  placeholder,
  onChange,
  readOnly
}) => (
  <input
    type={type}
    id={id}
    name={id}
    readOnly={readOnly}
    onChange={onChange}
    placeholder={placeholder}
    className={
      classTrim(`
        ainput
        ${readOnly === true ? 'ainput--readonly' : ''}
        ${className ?? ''}
      `)
    }
    value={value}
  />
);

export default Ainput;
