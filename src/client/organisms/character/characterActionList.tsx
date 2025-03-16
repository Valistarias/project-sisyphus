import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ali, Atitle, Aul } from '../../atoms';
import { curateCharacterAction } from '../../utils/character';

import CharacterAction from './characterAction';

import type { ICuratedAction } from '../../types';

import { classTrim } from '../../utils';

import './characterActionList.scss';

const CharacterActionList: FC = () => {
  const { t } = useTranslation();
  const { character, actionTypes, actionDurations } = useGlobalVars();

  const curatedActionList = useMemo<{
    nodeActions: ICuratedAction[];
  }>(() => {
    const curatedNodeActions: ICuratedAction[] = [];

    if (
      character !== null &&
      character !== false &&
      actionTypes.length !== 0 &&
      actionDurations.length !== 0
    ) {
      character.nodes?.forEach(({ node }) => {
        if (node.actions.length !== 0) {
          const cleanNodeAction = node.actions.map((action) =>
            curateCharacterAction({ action, actionTypes, actionDurations })
          );
          curatedNodeActions.push(...cleanNodeAction);
        }
      });
    }

    return {
      nodeActions: curatedNodeActions,
    };
  }, [character, actionTypes, actionDurations]);

  return (
    <div
      className={classTrim(`
      char-action-list
    `)}
    >
      {curatedActionList.nodeActions.length > 0 && (
        <div className="char-action-list__nodes">
          <Atitle level={3} className="char-action-list__nodes__title">
            {t('characterActionList.nodes.title', { ns: 'components' })}
          </Atitle>
          <Aul noPoints className="char-action-list__nodes__list">
            {curatedActionList.nodeActions.map((nodeAction) => (
              <Ali key={nodeAction.action._id} className="char-action-list__nodes__list__elt">
                <CharacterAction action={nodeAction} />
              </Ali>
            ))}
          </Aul>
        </div>
      )}
    </div>
  );
};

export default CharacterActionList;
