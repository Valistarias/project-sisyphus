import React, { type FC } from 'react';

import { Aa } from '../atoms';

import { classTrim } from '../utils';

import './dropDownList.scss';

interface ILinkElt {
  /** The link */
  href: string;
  /** The text */
  text: string;
}

interface IDropDownList {
  /** The main element of the list */
  title: ILinkElt;
  /** The elements present in the dropdown */
  content: ILinkElt[];
  /** The class of the DropDownList element */
  className?: string;
}

const DropDownList: FC<IDropDownList> = ({ title, content, className }) => (
  <div
    className={classTrim(`
        dropdown-list
        ${className ?? ''}
      `)}
  >
    <Aa className="dropdown-list__main" href={title.href}>
      {title.text}
    </Aa>
    <div className="dropdown-list__list">
      {content.map((single) => (
        <Aa className="dropdown-list__list__elt" href={single.href} key={single.href}>
          {single.text}
        </Aa>
      ))}
    </div>
  </div>
);

export default DropDownList;
