import React, { type FC } from 'react';

import { Ainput } from '../atoms';

import Button from './button';

import { classTrim } from '../utils';

import './searchBar.scss';

interface ISearchBar {
  /** The placeholder when the searchbar is empty */
  placeholder?: string;
  /** The search value */
  search: string;
  /** The class of the searchBar element */
  className?: string;
  /** When the search bar changes */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** When the search bar changes */
  onClean: (e: React.MouseEvent<HTMLElement>) => void;
}

const SearchBar: FC<ISearchBar> = ({ search, placeholder, onClean, onChange, className }) => (
  <div
    className={classTrim(`
      search-bar
      ${className ?? ''}
    `)}
  >
    <Ainput
      className="search-bar__input"
      value={search}
      onChange={onChange}
      placeholder={placeholder}
    />
    <Button
      className="search-bar__button"
      icon={search !== '' ? 'Cross' : 'Search'}
      unclickable={search === ''}
      active={search !== ''}
      onClick={onClean}
    />
  </div>
);

export default SearchBar;
