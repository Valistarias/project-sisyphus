import React, { useRef, useState, type FC, type ReactNode } from 'react';

import { Quark } from '../quark';

import LinkButton, { type ILinkButton } from './linkButton';

import { classTrim, setHintPlacement } from '../utils';

import './hintButtonLink.scss';

export type IHintButtonLink = ILinkButton & {
  /** The content of the hint */
  hint: ReactNode;
};

const HintButtonLink: FC<IHintButtonLink> = ({ className, hint, ...rest }) => {
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
      quarkType="span"
      className={classTrim(`
        hint-button-link
        hint-button-link--${placement}
        ${className ?? ''}
      `)}
      ref={domPosition}
    >
      <LinkButton {...rest} onMouseEnter={handleMouseEnter} />
      <span className="hint-button-link__hint" ref={hintPosition}>
        {hint}
      </span>
    </Quark>
  );
};

export default HintButtonLink;
