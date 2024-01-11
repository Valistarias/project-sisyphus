import React, { Fragment, type FC } from 'react';

import { Aa } from '../atoms';

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
      theme="link"
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
    {/* {title.href !== undefined ? (
      <Aa
        className="dropdown-menu__main"
        href={title.href}
        onClick={() => {
          if (isOpen) {
            onOpen();
          } else {
            onClose();
          }
        }}
      >
        {title.text}
      </Aa>
    ) : (
      <Button
        onClick={(e) => {
          if (title.onClick !== undefined) {
            title.onClick(e);
          }
          if (isOpen) {
            onOpen();
          } else {
            onClose();
          }
        }}
      >
        {title.text}
      </Button>
    )} */}

    <div
      className={classTrim(`
        dropdown-menu__list
        ${isOpen ? 'dropdown-menu__list--open' : ''}
      `)}
    >
      {content.map((single) => (
        <Fragment key={single.href ?? single.text}>
          {single.href !== undefined ? (
            <Aa className="dropdown-menu__list__elt" href={single.href} onClick={onClose}>
              {single.text}
            </Aa>
          ) : (
            <Button
              className="dropdown-menu__list__elt"
              theme="link"
              onClick={(e) => {
                if (single.onClick !== undefined) {
                  single.onClick(e);
                }
                onClose();
              }}
            >
              {single.text}
            </Button>
          )}
        </Fragment>
      ))}
    </div>
  </div>
);

export default DropDownMenu;
