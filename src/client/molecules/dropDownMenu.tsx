import React, { type FC } from 'react';

import Button from './button';

import { classTrim } from '../utils';

import './dropDownMenu.scss';

interface ILinkElt {
  /** The link */
  href?: string;
  /** The onClick event sent when necessary */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** The text */
  text: string;
}

interface IDropDownMenu {
  /** The main element of the list */
  title: ILinkElt;
  /** The elements present in the dropdown */
  content: ILinkElt[];
  /** The class of the DropDownMenu element */
  className?: string;
  /** When the menu is hovered */
  onOpen: () => void;
  /** When the menu is not hovered anymore */
  onClose: () => void;
  /** Is the menu open */
  isOpen: boolean;
}

const DropDownMenu: FC<IDropDownMenu> = ({
  title,
  content,
  className,
  onOpen,
  onClose,
  isOpen,
}) => (
  <div
    className={classTrim(`
        dropdown-menu
        ${className ?? ''}
      `)}
  >
    <Button
      className="dropdown-menu__main"
      theme="bland"
      onClick={(e) => {
        if (title.onClick !== undefined) {
          title.onClick(e);
        }
        if (isOpen) {
          onClose();
        } else {
          onOpen();
        }
      }}
    >
      {title.text}
    </Button>

    <div
      className={classTrim(`
        dropdown-menu__list
        ${isOpen ? 'dropdown-menu__list--open' : ''}
      `)}
    >
      {content.map((single) => (
        <Button
          key={single.href ?? single.text}
          className="dropdown-menu__list__elt"
          theme="text-only"
          onClick={(e) => {
            if (single.onClick !== undefined) {
              single.onClick(e);
            }
            onClose();
          }}
          href={single.href}
        >
          {single.text}
        </Button>
      ))}
    </div>
  </div>
);

export default DropDownMenu;
