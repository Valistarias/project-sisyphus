import React from 'react';
import {
  useCallback, useEffect, useState, type FC
} from 'react';

import { Controller } from 'react-hook-form';

import holoBackground from '../assets/imgs/tvbg2.gif';
import {
  Abutton, Aerror, Aicon, Alabel, AnodeIcon
} from '../atoms';
import {
  Quark, type IQuarkProps
} from '../quark';
import {
  possibleNodeIcons, type TypeNodeIcons
} from '../types/rules';

import type { IReactHookFormInputs } from '../types';

import { classTrim } from '../utils';

import './nodeIconSelect.scss';

interface INodeIconSelect , IReactHookFormInputs {
  /** The label, if any */
  label?: string
}

const defaultNodeIcon: TypeNodeIcons = 'default';

const NodeIconSelect: FC<IQuarkProps<INodeIconSelect>> = ({
  className, inputName, rules, control, label
}) => {
  // const [selected, setSelected] = useState<TypeNodeIcons>(defaultNodeIcon);
  const [isOpen, setOpenMenu] = useState(false);

  const closeMenu = useCallback((e: MouseEvent) => {
    if (
      e.target !== null
      && !(e.target as Element).classList.contains('nodeiconselect__list__visual')
    ) {
      setOpenMenu(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', closeMenu);

    return () => {
      document.removeEventListener('click', closeMenu);
    };
  }, [closeMenu]);

  return (
    <Quark
      quarkType="div"
      className={classTrim(`
        nodeiconselect
        ${isOpen ? 'nodeiconselect--open' : ''}
        ${className ?? ''}
      `)}
    >
      <Controller
        control={control}
        name={inputName}
        rules={rules}
        render={({
          field: {
            onChange, value, name
          }, fieldState: { error }
        }) => (
          <>
            {label !== undefined
              ? (
                  <Alabel className="nodeiconselect__label" htmlFor={name}>
                    {label}
                  </Alabel>
                )
              : null}
            <Abutton
              className="nodeiconselect__display"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setOpenMenu(prev => !prev);
              }}
            >
              <AnodeIcon className="nodeiconselect__display__visual" type={value} />
              <Aicon className="nodeiconselect__display__arrow" type="Arrow" />
            </Abutton>
            <div
              className="nodeiconselect__list"
              style={{ backgroundImage: `url(${holoBackground})` }}
            >
              {possibleNodeIcons.map(possibleNodeIcon => (
                <Abutton
                  key={possibleNodeIcon}
                  className="nodeiconselect__list__elt"
                  onClick={(e: React.MouseEvent<HTMLElement>) => {
                    e.preventDefault();
                    onChange(possibleNodeIcon);
                    setOpenMenu(false);
                  }}
                >
                  <AnodeIcon
                    className="nodeiconselect__list__visual"
                    size="large"
                    type={possibleNodeIcon}
                  />
                </Abutton>
              ))}
            </div>
            {error?.message !== undefined
              ? (
                  <Aerror className="nodeiconselect__error">{error.message}</Aerror>
                )
              : null}
          </>
        )}
      />
    </Quark>
  );
};

export {
  defaultNodeIcon, NodeIconSelect
};
