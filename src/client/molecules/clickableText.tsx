import React from 'react';
import { useRef, useState, type FC, type ReactNode } from 'react';

import { Abutton, type IAButton } from '../atoms';

import type { IQuarkProps } from '../quark';

import { classTrim, setHintPlacement } from '../utils';

import './clickableText.scss';

interface IClickableText extends IQuarkProps<IAButton> {
  /** The clickable text */
  text: string;
  /** The theme of the clickable text */
  theme?: 'decor' | 'mono';
  /** When the clickable text is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Helper/details attached to this text */
  hint?: ReactNode;
}

const ClickableText: FC<IClickableText> = ({ text, theme = 'decor', onClick, className, hint }) => {
  const [placement, setPlacement] = useState<string>('right');

  const domPosition = useRef<HTMLDivElement>(null);
  const hintPosition = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (): void => {
    if (domPosition.current !== null && hintPosition.current !== null) {
      const domPos = domPosition.current.getBoundingClientRect();
      const hintPos = hintPosition.current.getBoundingClientRect();

      setPlacement(setHintPlacement(domPos, hintPos, 'right'));
    }
  };

  return (
    <div
      className={classTrim(`
      clickable-text
      clickable-text--${theme}
      ${onClick === undefined ? 'clickable-text--unclickable' : ''}
      clickable-text--${placement}
      ${hint !== undefined ? 'clickable-text--hint' : ''}
      ${className ?? ''}
    `)}
      ref={domPosition}
    >
      <Abutton className="clickable-text__button" onClick={onClick} onMouseEnter={handleMouseEnter}>
        {text}
      </Abutton>
      {hint !== undefined ? (
        <span className="clickable-text__hint" ref={hintPosition}>
          {hint}
        </span>
      ) : null}
    </div>
  );
};

export default ClickableText;
