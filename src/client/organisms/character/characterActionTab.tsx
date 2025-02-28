import React from 'react';
import type { FC } from 'react';

import { useTranslation } from 'react-i18next';

import './characterActionTab.scss';

const CharacterActionTab: FC = () => {
  const { t } = useTranslation();

  return <p>This is test 111</p>;
};

export default CharacterActionTab;
