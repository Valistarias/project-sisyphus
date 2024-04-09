import React, { useState, type FC } from 'react';

import { Abutton, AnodeIcon } from '../atoms';
import { Quark, type IQuarkProps } from '../quark';
import { type TypeNodeIcons } from '../types/rules';

import { classTrim } from '../utils';

import './nodeIconSelect.scss';

interface INodeIconSelect extends IQuarkProps {}

const defaultNodeIcon: TypeNodeIcons = 'default';

const NodeIconSelect: FC<INodeIconSelect> = ({ className }) => {
  const [selected, setSelected] = useState(defaultNodeIcon);
  const [isOpen, setisOpen] = useState(false);
  console.log('selected', selected);
  return (
    <Quark
      quarkType="div"
      className={classTrim(`
        nodeiconselect
        ${isOpen ? 'nodeiconselect--open' : ''}
        ${className ?? ''}
      `)}
    >
      <Abutton className="nodeiconselect__display">
        <AnodeIcon type={selected} />
      </Abutton>
      <div className="nodeiconselect__list"></div>
    </Quark>
  );
};

export { NodeIconSelect, defaultNodeIcon };
