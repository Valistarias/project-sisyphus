import type React from 'react';
import { useMemo, type FC } from 'react';

import { Ali, Atitle, Aul } from '../atoms';

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
  content: Array<
    | ILinkElt
    | {
        title: string;
        list: ILinkElt[];
      }
  >;
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
}) => {
  const listElt = useMemo(() => {
    const sentElts: React.JSX.Element[] = [];
    content.forEach(
      (
        single:
          | {
              title: string;
              list: ILinkElt[];
            }
          | ILinkElt
      ) => {
        if ((single as ILinkElt).text !== undefined) {
          const { href, text, onClick } = single as ILinkElt;
          sentElts.push(
            <Button
              key={`eltlist-${href ?? text}`}
              className="dropdown-menu__list__elt"
              theme="text-only"
              onClick={(e) => {
                if (onClick !== undefined) {
                  onClick(e);
                }
                onClose();
              }}
              href={href}
            >
              {text}
            </Button>
          );
        } else {
          const { title, list } = single as {
            title: string;
            list: ILinkElt[];
          };
          sentElts.push(
            <div key={`sublist-${title}`} className="dropdown-menu__list__sublist">
              <Atitle level={4} className="dropdown-menu__list__sublist__title">
                {title}
              </Atitle>
              <Aul className="dropdown-menu__list__sublist__list">
                {list.map(({ href, text, onClick }) => (
                  <Ali
                    className="dropdown-menu__list__sublist__list__elt"
                    key={`eltsublist-${href ?? text}`}
                  >
                    <Button
                      className="dropdown-menu__list__elt"
                      theme="text-only"
                      onClick={(e) => {
                        if (onClick !== undefined) {
                          onClick(e);
                        }
                        onClose();
                      }}
                      href={href}
                    >
                      {text}
                    </Button>
                  </Ali>
                ))}
              </Aul>
            </div>
          );
        }
      }
    );
    return sentElts;
  }, [content, onClose]);
  return (
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
        {listElt}
      </div>
    </div>
  );
};

export default DropDownMenu;
