import React, { useRef, useState, type FC, type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

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
  /** When the helper is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

const Helper: FC<IHelper> = ({ children, size = 'medium', theme = 'solid', onClick }) => {
  const { t } = useTranslation();

  const [delayHandler, setDelayHandler] = useState<NodeJS.Timeout | null>(null);
  const [isHelperOpen, setHelperOpen] = useState<boolean>(false);
  const [placement, setPlacement] = useState<string>('top-left');

  const domHelperContent = useRef<HTMLDivElement>(null);

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
      if (topBottom === 'top' && dimensions.bottom + dimensions.height + 30 < windowHeight) {
        topBottom = 'bottom';
      } else if (
        topBottom === 'bottom' &&
        dimensions.bottom + dimensions.height + 30 > windowHeight
      ) {
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

  return (
    <Quark
      quarkType="span"
      className={classTrim(`
        helper
        ${isHelperOpen ? 'helper--open' : ''}
        ${onClick !== undefined ? 'helper--clickable' : ''}
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
        onClick={(e) => {
          if (onClick !== undefined) {
            onClick(e);
            handleMouseLeave();
          }
        }}
      />
      <div className="helper__content" ref={domHelperContent}>
        {children}
        {onClick !== undefined ? (
          <span className="helper__content__info">{t('helper.more', { ns: 'components' })}</span>
        ) : null}
      </div>
    </Quark>
  );
};

export default Helper;
