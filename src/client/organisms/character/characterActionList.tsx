import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ali, Atitle, Aul } from '../../atoms';
import { curateCharacterAction } from '../../utils/character';

import CharacterAction from './characterAction';

import type { ICuratedAction } from '../../types';

import { classTrim } from '../../utils';

import './characterActionList.scss';

const displayingOrder = ['action', 'free', 'long'];

const CharacterActionList: FC = () => {
  const { t } = useTranslation();
  const { character, actionTypes, actionDurations, basicActions } = useGlobalVars();

  const curatedActionList = useMemo<Record<string, ICuratedAction[]>>(() => {
    const curatedNodeActions: Record<string, ICuratedAction[]> = {};

    if (
      character !== null &&
      character !== false &&
      actionTypes.length !== 0 &&
      actionDurations.length !== 0
    ) {
      character.nodes?.forEach(({ node }) => {
        if (node.actions.length !== 0) {
          node.actions.forEach((action) => {
            const curatedAction = curateCharacterAction({ action, actionTypes, actionDurations });

            if (
              (curatedNodeActions[curatedAction.action.duration] as
                | ICuratedAction[]
                | undefined) === undefined
            ) {
              curatedNodeActions[curatedAction.action.duration] = [];
            }
            curatedNodeActions[curatedAction.action.duration].push(curatedAction);
          });
        }
      });
    }

    basicActions.forEach((action) => {
      const curatedAction = curateCharacterAction({ action, actionTypes, actionDurations });
      if (
        (curatedNodeActions[curatedAction.action.duration] as ICuratedAction[] | undefined) ===
        undefined
      ) {
        curatedNodeActions[curatedAction.action.duration] = [];
      }
      curatedNodeActions[curatedAction.action.duration].push(curatedAction);
    });

    return curatedNodeActions;
  }, [character, actionTypes, actionDurations, basicActions]);

  return (
    <div
      className={classTrim(`
      char-action-list
    `)}
    >
      {displayingOrder.map((eltOrder) =>
        (curatedActionList[eltOrder] as ICuratedAction[] | undefined) !== undefined ? (
          <div className="char-action-list__nodes" key={eltOrder}>
            <Atitle level={3} className="char-action-list__nodes__title">
              {t(`terms.actionDuration.${eltOrder}`)}
            </Atitle>
            <Aul noPoints className="char-action-list__nodes__list">
              {curatedActionList[eltOrder].map((nodeAction) => (
                <Ali key={nodeAction.action._id} className="char-action-list__nodes__list__elt">
                  <CharacterAction action={nodeAction} />
                </Ali>
              ))}
            </Aul>
          </div>
        ) : null
      )}
    </div>
  );
};

export default CharacterActionList;
