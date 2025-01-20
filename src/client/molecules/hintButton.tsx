import React, {
  useRef, useState, type FC, type ReactNode
} from 'react';

import { Quark } from '../quark';

import LinkButton, { type ILinkButton } from './linkButton';

import { classTrim } from '../utils';

import './hintButton.scss';

export type IHintButton = ILinkButton & {
  /** The content of the hint */
  hint: ReactNode
};

const HintButton: FC<IHintButton> = ({
  className, hint, ...rest
}) => {
  const [delayHandler, setDelayHandler] = useState<NodeJS.Timeout | null>(null);
  const [isHintOpen, setHintOpen] = useState<boolean>(false);
  const [placement, setPlacement] = useState<string>('top-left');

  const hintContent = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (): void => {
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
      }, 200)
    );
  };

  const handleMouseLeave = (): void => {
    if (delayHandler !== null) {
      clearTimeout(delayHandler);
      setHintOpen(false);
    }
  };

  return (
    <Quark
      quarkType="span"
      className={classTrim(`
        hint-button
        ${isHintOpen ? 'hint-button--open' : ''}
        hint-button--${placement}
        ${className ?? ''}
      `)}
    >
      <LinkButton
        {...rest}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      <span className="hint-button__hint" ref={hintContent}>
        {hint}
      </span>
    </Quark>
  );
};

export default HintButton;
