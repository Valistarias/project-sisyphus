import React, { type FC, useState, useEffect } from 'react';
import Select, { components, type OptionProps } from 'react-select';

import { useTranslation } from 'react-i18next';

import { Alabel, Ap } from '../atoms';

import { classTrim } from '../utils';

import './select.scss';

interface ISingleValueSelect {
  value: string;
  label: string;
  details?: string;
}

interface IGroupedOption {
  readonly label: string;
  readonly cat: string;
  readonly options: readonly ISingleValueSelect[];
}

interface IAp {
  /** The options for the select */
  options: ISingleValueSelect[] | IGroupedOption[];
  /** When an optiojn is selected */
  selected?: ISingleValueSelect | null;
  /** When the select change his value */
  onChange: (elt: ISingleValueSelect) => void;
  /** Define the placeholder for this field */
  placeholder?: string;
  /** The label, if any */
  label?: string;
  /** The classname of the select */
  className?: string;
  /** The size of the select */
  size?: 'medium' | 'small';
}

const Option: FC<OptionProps<ISingleValueSelect, false>> = ({ children, ...props }) => {
  if (props.data.details !== null) {
    return (
      <components.Option
        {...props}
        className={classTrim(`
          smartselect__option--double
          ${props.className ?? ''}
        `)}
      >
        <span className="smartselect__option__children">{children}</span>
        <span className="smartselect__option__details">{props.data.details}</span>
      </components.Option>
    );
  }
  return <components.Option {...props}>{children}</components.Option>;
};

const formatGroupLabel: FC = (data: IGroupedOption) => (
  <div className="smartselect__group-label">
    <span className="smartselect__group-label__name">{data.label}</span>
    <span className="smartselect__group-label__list">{data.options.length}</span>
  </div>
);

const SmartSelect: FC<IAp> = ({
  options,
  size = 'medium',
  label,
  onChange,
  placeholder = null,
  selected = null,
  className = null,
}) => {
  const { t } = useTranslation();

  const [selectedElt, setSelectedElt] = useState<ISingleValueSelect | null>(null);

  useEffect(() => {
    if (selected !== null) {
      setSelectedElt(selected);
    }
  }, [selected]);

  return (
    <div
      className={classTrim(`
        smartselect
        ${className ?? ''}
        smartselect--${size}
      `)}
    >
      {label !== undefined ? <Alabel>{label}</Alabel> : null}
      <Select
        onChange={(choice: ISingleValueSelect) => {
          setSelectedElt(choice);
          onChange(choice);
        }}
        value={selectedElt}
        options={options}
        className="smartselect__field"
        classNamePrefix="smartselect"
        components={{ Option }}
        placeholder={placeholder ?? t('smartselect.placeholder', { ns: 'components' })}
        noOptionsMessage={() => <Ap>{t('smartselect.notfound', { ns: 'components' })}</Ap>}
        formatGroupLabel={formatGroupLabel}
      />
    </div>
  );
};

export { SmartSelect, type ISingleValueSelect, type IGroupedOption };
