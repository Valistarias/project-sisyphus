import React, { type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Atitle } from '../../atoms';

import { classTrim } from '../../utils';

import './characterProgramList.scss';

const CharacterProgramList: FC = () => {
  const { t } = useTranslation();

  return (
    <div
      className={classTrim(`
      char-program-list
    `)}
    >
      <Atitle level={3} className="char-program-list__title">
        TBD
      </Atitle>
    </div>
  );
};

export default CharacterProgramList;
