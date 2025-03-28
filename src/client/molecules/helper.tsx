import React from 'react';
import { useRef, useState, type FC, type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { Aicon } from '../atoms';
import { Quark, type IQuarkProps } from '../quark';

import { classTrim, setHintPlacement } from '../utils';

import './helper.scss';

interface IHelper {
  /** The content of the helper */
  children: ReactNode;
  /** The size of the helper */
  size?: 'medium' | 'small';
  /** The theme of the helper */
  theme?: 'solid' | 'text-only';
  /** When the helper is clicked */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

const Helper: FC<IQuarkProps<IHelper>> = ({
  children,
  size = 'medium',
  theme = 'solid',
  onClick,
}) => {
  const { t } = useTranslation();

  const [placement, setPlacement] = useState<string>('bottom-left');

  const domPosition = useRef<HTMLDivElement>(null);
  const hintPosition = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (): void => {
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
        helper
        ${onClick !== undefined ? 'helper--clickable' : ''}
        helper--${placement}
        helper--${size}
        helper--${theme}
      `)}
      ref={domPosition}
    >
      <Aicon
        className="helper__icon"
        type="Question"
        size="small"
        onMouseEnter={handleMouseEnter}
        onClick={(e) => {
          if (onClick !== undefined) {
            onClick(e);
          }
        }}
      />
      <span className="helper__hint" ref={hintPosition}>
        {children}
        {onClick !== undefined ? (
          <span className="helper__hint__info">{t('helper.more', { ns: 'components' })}</span>
        ) : null}
      </span>
    </Quark>
  );
};

export default Helper;
