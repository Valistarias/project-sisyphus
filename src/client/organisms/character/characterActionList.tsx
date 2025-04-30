import React, { Fragment, useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ali, Ap, Atitle, Aul } from '../../atoms';
import { HintText } from '../../molecules';
import { curateCharacterAction, getActualBody } from '../../utils/character';
import { CharacterAction, ProgramAction, WeaponAction } from '../actionLine';

import type { IBodyProgram, IBodyWeapon, ICuratedAction, TypeCampaignEvent } from '../../types';

import { classTrim, type DiceRequest } from '../../utils';

import './characterActionList.scss';

const displayingOrder = ['action', 'free', 'long'];

interface ICharacterActionList {
  /** The function sent to roll the dices */
  onRollDices: (diceValues: DiceRequest[], id: TypeCampaignEvent) => void;
}

const CharacterActionList: FC<ICharacterActionList> = ({ onRollDices }) => {
  const { t } = useTranslation();
  const { character, actionTypes, actionDurations, basicActions } = useGlobalVars();

  const curatedActionList = useMemo<{
    weapons: IBodyWeapon[];
    programs: IBodyProgram[];
    character: Record<string, ICuratedAction[]>;
    basic: Record<string, ICuratedAction[]>;
  }>(() => {
    const curatedWeapons: IBodyWeapon[] = [];
    const curatedPrograms: IBodyProgram[] = [];
    const curatedNodeActions: Record<string, ICuratedAction[]> = {};
    const curatedNodeBasicActions: Record<string, ICuratedAction[]> = {};

    if (
      character !== null &&
      character !== false &&
      actionTypes.length !== 0 &&
      actionDurations.length !== 0
    ) {
      // Weapons
      const { body } = getActualBody(character);
      if (body?.weapons !== undefined && body.weapons.length > 0) {
        curatedWeapons.push(...body.weapons);
      }
      if (body?.programs !== undefined && body.programs.length > 0) {
        curatedPrograms.push(...body.programs);
      }

      // Nodes
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
      weapons: curatedWeapons,
      programs: curatedPrograms,
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
            {eltOrder === 'action' ? (
              <>
                <Aul className="char-action-list__nodes__weapons" noPoints>
                  {curatedActionList.weapons.map((bodyWeapon) => (
                    <Ali key={bodyWeapon._id} className="char-action-list__nodes__list-char__elt">
                      <WeaponAction weapon={bodyWeapon} onRollDices={onRollDices} />
                    </Ali>
                  ))}
                </Aul>
                <Aul className="char-action-list__nodes__programs" noPoints>
                  {curatedActionList.programs.map((bodyProgram) => (
                    <Ali key={bodyProgram._id} className="char-action-list__nodes__list-char__elt">
                      <ProgramAction program={bodyProgram} onRollDices={onRollDices} />
                    </Ali>
                  ))}
                </Aul>
              </>
            ) : null}
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
