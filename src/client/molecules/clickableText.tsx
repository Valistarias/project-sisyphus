import React, { type FC } from 'react';

import { Abutton, type IAButton } from '../atoms';

import { classTrim } from '../utils';

import './clickableText.scss';

interface IClickableText extends IAButton {
  /** The clickable text */
  text: string;
  /** When the clickable text is clicked */
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
}

const ClickableText: FC<IClickableText> = ({ text, onClick, className }) => {
  return (
    <Abutton
      className={classTrim(`
      clickable-text
      ${className ?? ''}
    `)}
      onClick={onClick}
    >
      {text}
    </Abutton>
  );
};

export default ClickableText;
