import React, { useRef, useState, type FC, type ReactNode } from 'react';

import { Quark } from '../quark';

import { classTrim, setHintPlacement } from '../utils';

import './hintText.scss';

export interface IHintText {
  /** The content of the hint */
  hint: ReactNode;
  /** The text displayed for the hint */
  children: ReactNode;
  /** Is the hint to be without style ? */
  noDecor?: boolean;
  /** The associated className inherited */
  className?: string;
}

const HintText: FC<IHintText> = ({ className, hint, noDecor = false, children }) => {
  const [placement, setPlacement] = useState<string>('top-left');

  const domPosition = useRef<HTMLDivElement>(null);
  const hintPosition = useRef<HTMLDivElement>(null);

  const handleMouseEnterHint = (): void => {
    if (domPosition.current !== null && hintPosition.current !== null) {
      const domPos = domPosition.current.getBoundingClientRect();
      const hintPos = hintPosition.current.getBoundingClientRect();

      setPlacement(setHintPlacement(domPos, hintPos, 'bottom-left'));
    }
  };

  return (
    <Quark
      quarkType="span"
      className={classTrim(`
        hint-text
        hint-text--${placement}
        ${!noDecor ? 'hint-text--decor' : ''}
        ${className ?? ''}
      `)}
      ref={domPosition}
      onMouseEnter={hint !== undefined ? handleMouseEnterHint : undefined}
    >
      {children}
      <span className="hint-text__hint" ref={hintPosition}>
        {hint}
      </span>
    </Quark>
  );
};

export default HintText;
