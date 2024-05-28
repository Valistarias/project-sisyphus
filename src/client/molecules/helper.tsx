import React, { useEffect, useRef, useState, type FC, type ReactNode } from 'react';

import { Aicon } from '../atoms';
import { Quark, type IQuarkProps } from '../quark';

import { classTrim } from '../utils';

import './helper.scss';

interface IHelper extends IQuarkProps {
  /** The content of the helper */
  children: ReactNode;
  /** The size of the helper */
  size?: 'medium' | 'small';
  /** The theme of the helper */
  theme?: 'solid' | 'text-only';
}

const Helper: FC<IHelper> = ({ children, size = 'medium', theme = 'solid' }) => {
  const [delayHandler, setDelayHandler] = useState<NodeJS.Timeout | null>(null);
  const [isHelperOpen, setHelperOpen] = useState<boolean>(false);
  const [placement, setPlacement] = useState<string>('bottom-left');

  const domHelperContent = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = (): void => {
    if (domHelperContent.current !== null) {
      const dimensions = domHelperContent.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      let topBottom = placement.split('-')[0];
      let leftRight = placement.split('-')[1];

      if (leftRight === 'left' && dimensions.right > windowWidth && dimensions.left > 60) {
        leftRight = 'right';
      } else if (leftRight === 'right' && dimensions.left < 0) {
        leftRight = 'left';
      }
      if (dimensions.bottom > windowHeight) {
        topBottom = 'top';
      }
      setPlacement(`${topBottom}-${leftRight}`);
    }
    setDelayHandler(
      setTimeout(() => {
        setHelperOpen(true);
      }, 500)
    );
  };

  const handleMouseLeave = (): void => {
    if (delayHandler !== null) {
      clearTimeout(delayHandler);
      setHelperOpen(false);
    }
  };

  useEffect(() => {
    setPlacement((prev) => {
      if (domHelperContent.current !== null) {
        const dimensions = domHelperContent.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        let topBottom = prev.split('-')[0];
        let leftRight = prev.split('-')[1];
        if (dimensions.right > windowWidth) {
          leftRight = 'right';
        }
        // 200 -> max height, to prevent flicker
        if (dimensions.top + 200 > windowHeight) {
          topBottom = 'top';
        }

        return `${topBottom}-${leftRight}`;
      }
      return prev;
    });
  }, []);

  return (
    <Quark
      quarkType="span"
      className={classTrim(`
        helper
        ${isHelperOpen ? 'helper--open' : ''}
        helper--${placement}
        helper--${size}
        helper--${theme}
      `)}
    >
      <Aicon
        className="helper__icon"
        type="question"
        size="small"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      <span className="helper__content" ref={domHelperContent}>
        {children}
      </span>
    </Quark>
  );
};

export default Helper;
