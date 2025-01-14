import React from 'react';
import {
  useRef, useState, type FC, type ReactNode
} from 'react';

import {
  Abutton, type IAButton
} from '../atoms';

import { classTrim } from '../utils';

import './clickableText.scss';

interface IClickableText extends IAButton {
  /** The clickable text */
  text: string
  /** When the clickable text is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  /** Helper/details attached to this text */
  hint?: ReactNode
}

const ClickableText: FC<IClickableText> = ({
  text, onClick, className, hint
}) => {
  const [delayHandler, setDelayHandler] = useState<NodeJS.Timeout | null>(null);
  const [isHintOpen, setHintOpen] = useState<boolean>(false);
  const [placement, setPlacement] = useState<string>('top-left');

  const hintContent = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (): void => {
    if (hint === undefined) return;
    if (hintContent.current !== null) {
      const dimensions = hintContent.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      let topBottom = placement.split('-')[0];
      let leftRight = placement.split('-')[1];

      if (leftRight === 'left' && dimensions.right > windowWidth && dimensions.left > 60) {
        leftRight = 'right';
      } else if (leftRight === 'right' && dimensions.left < 0) {
        leftRight = 'left';
      }
      if (topBottom === 'top' && dimensions.bottom + dimensions.height + 30 < windowHeight) {
        topBottom = 'bottom';
      } else if (
        topBottom === 'bottom'
        && dimensions.bottom + dimensions.height + 30 > windowHeight
      ) {
        topBottom = 'top';
      }
      setPlacement(`${topBottom}-${leftRight}`);
    }
    setDelayHandler(
      setTimeout(() => {
        setHintOpen(true);
      }, 800)
    );
  };

  const handleMouseLeave = (): void => {
    if (hint === undefined) return;
    if (delayHandler !== null) {
      clearTimeout(delayHandler);
      setHintOpen(false);
    }
  };

  return (
    <div
      className={classTrim(`
      clickable-text
      ${isHintOpen ? 'clickable-text--open' : ''}
      ${onClick === undefined ? 'clickable-text--unclickable' : ''}
      clickable-text--${placement}
      ${className ?? ''}
    `)}
    >
      <Abutton
        className="clickable-text__button"
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {text}
      </Abutton>
      {hint !== undefined
        ? (
            <span className="clickable-text__hint" ref={hintContent}>
              {hint}
            </span>
          )
        : null}
    </div>
  );
};

export default ClickableText;
