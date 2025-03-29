import React, { useRef, useState, type FC, type ReactNode } from 'react';

import { Aicon } from '../atoms';
import { Quark } from '../quark';

import Button, { type IButton } from './button';

import { classTrim, setHintPlacement } from '../utils';

import './hintButton.scss';

export type IHintButton = IButton & {
  /** The content of the hint */
  hint: ReactNode;
};

const HintButton: FC<IHintButton> = ({ className, hint, ...rest }) => {
  const [placement, setPlacement] = useState<string>('top-left');

  const domPosition = useRef<HTMLDivElement>(null);
  const hintPosition = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (): void => {
    if (domPosition.current !== null && hintPosition.current !== null) {
      const domPos = domPosition.current.getBoundingClientRect();
      const hintPos = hintPosition.current.getBoundingClientRect();

      setPlacement(setHintPlacement(domPos, hintPos, 'top-left'));
    }
  };

  return (
    <Quark
      quarkType="div"
      className={classTrim(`
        hint-button
        hint-button--${placement}
        ${className ?? ''}
      `)}
      ref={domPosition}
    >
      <Button {...rest} />
      <Aicon
        className="hint-button__icon"
        type="Question"
        size="small"
        onMouseEnter={handleMouseEnter}
      />
      <span className="hint-button__hint" ref={hintPosition}>
        {hint}
      </span>
    </Quark>
  );
};

export default HintButton;
