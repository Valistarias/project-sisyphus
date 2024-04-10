import React, { type FC } from 'react';

import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Select, { components, type OptionProps } from 'react-select';

import { Aerror, Alabel, Ap } from '../atoms';
import { type IReactHookFormInputs } from '../types/form';

import { classTrim } from '../utils';

import './select.scss';

interface ISingleValueSelect {
  value: string | number;
  label: string;
  details?: string;
}

interface IGroupedOption {
  readonly label: string;
  readonly cat: string;
  readonly options: readonly ISingleValueSelect[];
}

interface IAp extends IReactHookFormInputs {
  /** The options for the select */
  options: ISingleValueSelect[];
  /** Define the placeholder for this field */
  placeholder?: string;
  /** The label, if any */
  label?: string;
  /** The classname of the select */
  className?: string;
  /** Triggered when the selected field is changing */
  onChange?: (val: string | number) => void;
  /** The size of the select */
  size?: 'medium' | 'small';
  /** Is the field disabled */
  disabled?: boolean;
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
  control,
  inputName,
  options,
  size = 'medium',
  label,
  onChange: exteriorChange,
  placeholder = null,
  className = null,
  disabled = false,
  rules,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={classTrim(`
        smartselect
        ${className ?? ''}
        ${disabled ? 'smartselect--disabled' : ''}
        smartselect--${size}
      `)}
    >
      <Controller
        control={control}
        name={inputName}
        rules={rules}
        render={({
          field: { onChange, onBlur, value, name, ref },
          fieldState: { error },
          // formState,
        }) => (
          <>
            {label !== undefined ? (
              <Alabel className="smartselect__label" htmlFor={name}>
                {label}
              </Alabel>
            ) : null}
            <Select
              options={options}
              value={options.find((c) => c.value === value)}
              onChange={(val) => {
                if (val != null) {
                  onChange(val.value);
                  if (exteriorChange !== undefined) {
                    exteriorChange(val.value);
                  }
                }
              }}
              className="smartselect__field"
              classNamePrefix="smartselect"
              components={{ Option }}
              placeholder={placeholder ?? t('smartselect.placeholder', { ns: 'components' })}
              noOptionsMessage={() => <Ap>{t('smartselect.notfound', { ns: 'components' })}</Ap>}
              formatGroupLabel={formatGroupLabel}
            />
            {error?.message !== undefined ? (
              <Aerror className="input__error">{error.message}</Aerror>
            ) : null}
          </>
        )}
      />
    </div>
  );
};

export { SmartSelect, type IGroupedOption, type ISingleValueSelect };
