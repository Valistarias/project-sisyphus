import React, { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { classTrim } from '../../utils';

import './characterStatus.scss';

interface ICharacterStatus {
  /** The classname of the element */
  className?: string;
}

const CharacterStatus: FC<ICharacterStatus> = ({ className }) => {
  const { t } = useTranslation();

  return (
    <div
      className={classTrim(`
      char-status
      ${className ?? ''}
    `)}
    >
      Hello
    </div>
  );
};

export default CharacterStatus;
