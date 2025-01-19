import React, { type FC } from 'react';

import {
  Abutton, Ali, Aul
} from '../atoms';

import type { IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './ariane.scss';

interface IArianeElt {
  /** The identifier of the ariane element */
  key: string
  /** The label displayed */
  label: string
  /** Is this element the actual selected in the ariane thread */
  actual: boolean
  /** Is this element disabled and unclickable */
  disabled: boolean
}

interface IAriane {
  /** The data to display in the ariane thread */
  data: IArianeElt[]
  /** Is the ariane split into steps */
  isSteps?: boolean
  /** When an element of the ariane is clicked */
  onArianeClick?: (id: string | number) => void
}

const Ariane: FC<IAriane> = ({
  className, data, onArianeClick, isSteps = false
}) => (
  <Aul
    noPoints
    className={classTrim(`
        ariane
        ${className ?? ''}
        ${onArianeClick !== undefined ? 'ariane--clickable' : ''}
      `)}
  >
    {data.map(({
      key, label, actual, disabled
    }, index) => (
      <Ali
        key={key}
        className={classTrim(`
              ariane__elt
              ${actual ? 'ariane__elt--actual' : ''}
              ${disabled ? 'ariane__elt--disabled' : ''}
            `)}
      >
        <Abutton
          className="ariane__elt__btn"
          onClick={() => {
            if (onArianeClick !== undefined && !disabled) {
              onArianeClick(key);
            }
          }}
        >
          {isSteps ? <span className="ariane__elt__step">{index + 1}</span> : null}
          <span className="ariane__elt__label">{label}</span>
        </Abutton>
      </Ali>
    ))}
  </Aul>
);

export {
  Ariane, type IArianeElt
};
