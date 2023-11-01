import React, { type FC, useState, useEffect } from 'react';
import Select, { components, type OptionProps } from 'react-select';

import { useTranslation } from 'react-i18next';

import { Ap } from '../atoms';

import { classTrim } from '../utils';

import './select.scss';

interface ISingleValueSelect {
  value: string
  label: string
  details?: string
}

interface IAp {
  /** The options for the select */
  options: ISingleValueSelect[]
  /** When an optiojn is selected */
  selected?: ISingleValueSelect | null
  /** When the select change his value */
  onChange: (elt: ISingleValueSelect) => void
  /** Define the placeholder for this field */
  placeholder?: string
  /** The classname of the select */
  className?: string
}

const Option: FC<OptionProps<ISingleValueSelect, false>> = ({ children, ...props }) => {
  if (props.data.details !== null) {
    return (
      <components.Option
        {...props}
        className={
          classTrim(`
          smartselect__option--double
          ${props.className ?? ''}
        `)}
      >
        <span className="smartselect__option__children">
          {children}
        </span>
        <span className="smartselect__option__details">
          {props.data.details}
        </span>
      </components.Option>
    );
  }
  return (
    <components.Option {...props}>
      {children}
    </components.Option>
  );
};

const SmartSelect: FC<IAp> = ({
  options,
  onChange,
  placeholder = null,
  selected = null,
  className = null
}) => {
  const { t } = useTranslation();

  const [selectedElt, setSelectedElt] = useState<ISingleValueSelect | null>(null);

  useEffect(() => {
    if (selected !== null) {
      setSelectedElt(selected);
    }
  }, [selected]);

  return (
    <Select
      onChange={(choice: ISingleValueSelect) => {
        setSelectedElt(choice);
        onChange(choice);
      }}
      value={selectedElt}
      options={options}
      className={
        classTrim(`
        smartselect
        ${className ?? ''}
      `)}
      classNamePrefix="smartselect"
      components={{ Option }}
      placeholder={placeholder ?? t('smartselect.placeholder', { ns: 'components' })}
      noOptionsMessage={() => <Ap>{t('smartselect.notfound', { ns: 'components' })}</Ap>}
    />
  );
};

export { SmartSelect, type ISingleValueSelect };
