import React, { useRef, useState, type FC, type ReactNode } from 'react';

import { Aicon } from '../atoms';
import { Quark } from '../quark';

import Button, { type IButton } from './button';

import { classTrim, setHintPlacement } from '../utils';

import './hintButton.scss';

export type IHintButton = IButton & {
  /** The content of the hint */
  hint?: ReactNode;
  /** The content of the hint */
  question?: ReactNode;
};

const HintButton: FC<IHintButton> = ({ className, hint, question, ...rest }) => {
  const [placement, setPlacement] = useState<string>('top-left');

  const domPosition = useRef<HTMLDivElement>(null);
  const questionPosition = useRef<HTMLDivElement>(null);
  const hintPosition = useRef<HTMLDivElement>(null);

  const handleMouseEnterQuestion = (): void => {
    if (domPosition.current !== null && questionPosition.current !== null) {
      const domPos = domPosition.current.getBoundingClientRect();
      const questionPos = questionPosition.current.getBoundingClientRect();

      setPlacement(setHintPlacement(domPos, questionPos, 'top-left'));
    }
  };

  const handleMouseEnterHint = (): void => {
    if (domPosition.current !== null && hintPosition.current !== null) {
      const domPos = domPosition.current.getBoundingClientRect();
      const hintPos = hintPosition.current.getBoundingClientRect();

      setPlacement(setHintPlacement(domPos, hintPos, 'bottom-left'));
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
      onMouseEnter={hint !== undefined ? handleMouseEnterHint : undefined}
    >
      <Button {...rest} />
      {question !== undefined ? (
        <>
          <Aicon
            className="hint-button__icon"
            type="Question"
            size="small"
            onMouseEnter={handleMouseEnterQuestion}
          />
          <span className="hint-button__question" ref={questionPosition}>
            {question}
          </span>
        </>
      ) : null}
      {hint !== undefined ? (
        <span className="hint-button__hint" ref={hintPosition}>
          {hint}
        </span>
      ) : null}
    </Quark>
  );
};

export default HintButton;
