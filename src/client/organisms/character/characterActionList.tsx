import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ali, Atitle, Aul } from '../../atoms';

import type { ICuratedAction } from '../../types';

import { classTrim } from '../../utils';

import './characterActionList.scss';

const CharacterActionList: FC = () => {
  const { t } = useTranslation();
  const { character } = useGlobalVars();

  const curatedActionList = useMemo<{
    nodeActions: ICuratedAction[];
  }>(() => {
    const curatedNodeActions: ICuratedAction[] = [];

    if (character !== null && character !== false) {
      character.nodes?.forEach(({ node }) => {
        if (node.actions.length !== 0) {
          curatedNodeActions.push(...node.actions);
        }
      });
    }

    return {
      nodeActions: curatedNodeActions,
    };
  }, [character]);

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
                <p className="char-action-list__nodes__list__elt__title">
                  {nodeAction.action.title}
                </p>
              </Ali>
            ))}
          </Aul>
        </div>
      )}
    </div>
  );
};

export default CharacterActionList;
