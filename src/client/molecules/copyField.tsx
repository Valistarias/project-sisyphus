import React, { useCallback, useRef, type FC } from 'react';

import { Quark, type IQuarkProps } from '../quark';

import './copyField.scss';
import { classTrim } from '../utils';

interface ICopyField {
  /** The vlue displayed in the field */
  value: string;
}

const CopyField: FC<IQuarkProps<ICopyField>> = ({ className, value }) => {
  const inputContent = useRef<HTMLInputElement>(null);

  const onClickField = useCallback(() => {
    if (inputContent.current !== null) {
      inputContent.current.select();
    }
  }, []);

  return (
    <Quark
      quarkType="input"
      className={classTrim(`
          copy-field
          ${className ?? ''}
        `)}
      type="text"
      ref={inputContent}
      value={value}
      onClick={onClickField}
      readOnly
    />
  );
};

export default CopyField;
