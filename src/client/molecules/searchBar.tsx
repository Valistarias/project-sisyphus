import React, { type FC } from 'react';

import { Aicon, Ainput } from '../atoms';
import { type IReactHookFormInputs } from '../types/form';

import { classTrim } from '../utils';

import './searchBar.scss';

interface ISearchBar extends IReactHookFormInputs {
  /** The search value */
  search: string;
  /** The class of the searchBar element */
  className?: string;
  /** When the search bar changes */
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const SearchBar: FC<ISearchBar> = ({ search, onChange, className }) => (
  <div
    className={classTrim(`
      search-bar
      ${className ?? ''}
    `)}
  >
    <Ainput classname="search-bar__input" value={search} onChange={onChange} />
    <Aicon classname="search-bar__icon" type={search !== '' ? 'Cross' : 'Search'} />
  </div>
);

export default SearchBar;
