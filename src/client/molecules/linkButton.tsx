import React from 'react';
import type { FC } from 'react';

import { useNavigate } from 'react-router-dom';

import Button from './button';

import type { IButton } from './button';

import './button.scss';

export type ILinkButton = IButton & {
  /** The redirect (if there is) on a button click */
  href?: string;
};

const LinkButton: FC<ILinkButton> = ({ href, ...props }) => {
  const navigate = useNavigate();

  return (
    <Button
      {...props}
      onClick={(e) => {
        if (href !== undefined) {
          void navigate(href);
        }

        if (props.onClick !== undefined) {
          props.onClick(e);
        }
      }}
    >
      {props.children}
    </Button>
  );
};

export default LinkButton;
