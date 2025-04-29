import React, { useState, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Abutton, Aicon, Ap } from '../../atoms';

import type { ICuratedAction } from '../../types';

import { classTrim } from '../../utils';

import './characterAction.scss';

interface ICharacterAction {
  /** The action to display */
  action: ICuratedAction;
}

const CharacterAction: FC<ICharacterAction> = ({ action }) => {
  const { t } = useTranslation();
  const [isOpened, setOpen] = useState<boolean>(false);

  return (
    <div
      className={classTrim(`
      char-action
      ${isOpened ? 'char-action--opened' : ''}
    `)}
    >
      <Abutton
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        className="char-action__title"
      >
        {action.action.title}
        <Aicon type="Arrow" className="char-action__title__icon" size="small" />
      </Abutton>
      <div className="char-action__details">
        <div className="char-action__details__categories">
          <Ap className="char-action-detail">
            <span className="char-action-detail__spec">
              {t('characterAction.duration', { ns: 'components' })}
            </span>
            <span className="char-action-detail__info">
              {t(`terms.actionDuration.${action.action.duration}`)}
            </span>
          </Ap>
          <Ap className="char-action-detail">
            <span className="char-action-detail__spec">
              {t('characterAction.type', { ns: 'components' })}
            </span>
            <span className="char-action-detail__info">
              {t(`terms.actionType.${action.action.type}`)}
            </span>
          </Ap>
        </div>
        <Ap className="char-action__details__text">{action.action.summary}</Ap>
      </div>
    </div>
  );
};

export default CharacterAction;
