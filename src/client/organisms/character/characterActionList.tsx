import React, { Fragment, useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ali, Ap, Atitle, Aul } from '../../atoms';
import { HintText } from '../../molecules';
import { curateCharacterAction } from '../../utils/character';

import CharacterAction from './characterAction';

import type { ICuratedAction } from '../../types';

import { classTrim } from '../../utils';

import './characterActionList.scss';

const displayingOrder = ['action', 'free', 'long'];

const CharacterActionList: FC = () => {
  const { t } = useTranslation();
  const { character, actionTypes, actionDurations, basicActions } = useGlobalVars();

  const curatedActionList = useMemo<{
    character: Record<string, ICuratedAction[]>;
    basic: Record<string, ICuratedAction[]>;
  }>(() => {
    const curatedNodeActions: Record<string, ICuratedAction[]> = {};
    const curatedNodeBasicActions: Record<string, ICuratedAction[]> = {};

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
        (curatedNodeBasicActions[curatedAction.action.duration] as ICuratedAction[] | undefined) ===
        undefined
      ) {
        curatedNodeBasicActions[curatedAction.action.duration] = [];
      }
      curatedNodeBasicActions[curatedAction.action.duration].push(curatedAction);
    });

    return {
      character: curatedNodeActions,
      basic: curatedNodeBasicActions,
    };
  }, [character, actionTypes, actionDurations, basicActions]);

  return (
    <div
      className={classTrim(`
      char-action-list
    `)}
    >
      {displayingOrder.map((eltOrder) =>
        (curatedActionList.character[eltOrder] as ICuratedAction[] | undefined) !== undefined ||
        (curatedActionList.basic[eltOrder] as ICuratedAction[] | undefined) !== undefined ? (
          <div className="char-action-list__nodes" key={eltOrder}>
            <Atitle level={3} className="char-action-list__nodes__title">
              {t(`terms.actionDuration.${eltOrder}`)}
              <span className="char-action-list__nodes__title__line" />
            </Atitle>
            {(curatedActionList.character[eltOrder] as ICuratedAction[] | undefined) !==
            undefined ? (
              <Aul noPoints className="char-action-list__nodes__list-char">
                {curatedActionList.character[eltOrder].map((nodeAction) => (
                  <Ali
                    key={nodeAction.action._id}
                    className="char-action-list__nodes__list-char__elt"
                  >
                    <CharacterAction action={nodeAction} />
                  </Ali>
                ))}
              </Aul>
            ) : null}
            {(curatedActionList.basic[eltOrder] as ICuratedAction[] | undefined) !== undefined ? (
              <Ap className="char-action-list__nodes__list-basic">
                {curatedActionList.basic[eltOrder].map((nodeAction, index) => (
                  <Fragment key={nodeAction.action._id}>
                    <HintText hint={nodeAction.action.summary}>{nodeAction.action.title}</HintText>
                    {index < curatedActionList.basic[eltOrder].length - 1 ? <span>, </span> : null}
                  </Fragment>
                ))}
              </Ap>
            ) : null}
          </div>
        ) : null
      )}
    </div>
  );
};

export default CharacterActionList;
