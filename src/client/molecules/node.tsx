import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../providers';

import { Abutton, Ali, AnodeIcon, Ap, Atitle, Aul } from '../atoms';
import { RichTextElement } from '../organisms';
import { Quark } from '../quark';

import type {
  ICuratedCharParam,
  ICuratedNode,
  ICuratedSkill,
  ICuratedStat,
} from '../types';

import { classTrim, curateStringDamage, curateStringFormula } from '../utils';

import './node.scss';

interface INode {
  /** The Node to display */
  node: ICuratedNode;
  /** When the node is clicked */
  onNodeClick?: (id: string) => void;
  /** The size of the node icon */
  size?: 'small' | 'medium' | 'large';
  /** The position of the menu */
  menuDirection?: 'left' | 'right';
  /** The anchor of the menu */
  menuAnchor?: 'top' | 'center' | 'bottom';
}

const Node: FC<INode> = ({
  node,
  size = 'medium',
  onNodeClick,
  menuDirection = 'right',
  menuAnchor = 'center',
}) => {
  const { t } = useTranslation();
  const { character } = useGlobalVars();
  const { node: nodeElt, i18n } = node;
  const { skills, stats, charParams } = useGlobalVars();

  // TODO: Internationalization in ALL the file
  const content = nodeElt;

  const { charParamBonuses, statBonuses, skillBonuses, bonusCount } = useMemo<{
    charParamBonuses: Array<{
      value: number;
      charParam: ICuratedCharParam | undefined;
    }>;
    statBonuses: Array<{
      value: number;
      stat: ICuratedStat | undefined;
    }>;
    skillBonuses: Array<{
      value: number;
      skill: ICuratedSkill | undefined;
    }>;
    bonusCount: number;
  }>(() => {
    const curatedCharParams = node.node.charParamBonuses?.map(({ value, charParam }) => ({
      value,
      charParam:
        charParams.length > 0
          ? charParams.find(({ charParam: globalCharParams }) => globalCharParams._id === charParam)
          : undefined,
    }));

    const curatedStats = node.node.statBonuses?.map(({ value, stat }) => ({
      value,
      stat:
        stats.length > 0
          ? stats.find(({ stat: globalStats }) => globalStats._id === stat)
          : undefined,
    }));

    const curatedSkills = node.node.skillBonuses?.map(({ value, skill }) => ({
      value,
      skill:
        skills.length > 0
          ? skills.find(({ skill: globalSkills }) => globalSkills._id === skill)
          : undefined,
    }));

    return {
      charParamBonuses: curatedCharParams ?? [],
      statBonuses: curatedStats ?? [],
      skillBonuses: curatedSkills ?? [],
      bonusCount:
        (curatedSkills !== undefined ? curatedSkills.length : 0) +
        (curatedStats !== undefined ? curatedStats.length : 0) +
        (curatedCharParams !== undefined ? curatedCharParams.length : 0),
    };
  }, [node, charParams, stats, skills]);

  const noContent =
    (content.summary === null || content.summary === '<p class="ap"></p>') &&
    (content.quote === undefined || content.quote === '');

  return (
    <Quark
      quarkType="div"
      className={classTrim(`
        node
        node--${size}
        node--${menuDirection}
        node--${menuAnchor}
        ${noContent ? 'node--no-content' : ''}
      `)}
    >
      <Abutton
        type="button"
        onClick={
          onNodeClick !== undefined
            ? () => {
                onNodeClick(nodeElt._id);
              }
            : undefined
        }
        className="node__icon"
      >
        <AnodeIcon size={size} type={nodeElt.icon} />
      </Abutton>
      <div className="node__content">
        <div className="node__content__vertical">
          <div className="node__content__main">
            <Atitle className="node__content__main__title" level={3}>
              {content.title}
            </Atitle>
            <div className="node__content__main__infos">
              <Ap>{`${t('terms.node.rank')}: ${nodeElt.rank}`}</Ap>
            </div>
            {content.summary !== null && content.summary !== '<p class="ap"></p>' ? (
              <RichTextElement
                className="node__content__main__text"
                rawStringContent={content.summary}
                readOnly
              />
            ) : null}
            {content.quote !== undefined && content.quote !== '' ? (
              <Ap className="node__content__main__quote">{`"${content.quote}"`}</Ap>
            ) : null}
          </div>
          {nodeElt.actions !== undefined
            ? nodeElt.actions.map((action) => (
                <div className="node__content__action" key={`action-${action._id}`}>
                  <div className="node__content__action__title">
                    <Ap className="node__content__action__title__elt">{`${action.isKarmic ? `${t('terms.node.offering')}: ` : ''}${action.title}`}</Ap>
                    {action.time !== undefined ? (
                      <Ap className="node__content__action__title__detail">
                        {`${t(`terms.node.time`)}: ${action.time}`}
                      </Ap>
                    ) : null}
                    <Ap className="node__content__action__title__detail">
                      {t(`terms.node.action`)}
                    </Ap>
                  </div>
                  <div className="node__content__action__summary">
                    <Ap>
                      {curateStringDamage(
                        action.summary,
                        action.damages,
                        action.offsetSkill ?? '',
                        character
                      )}
                    </Ap>
                    {action.uses !== undefined ? (
                      <Ap className="node__content__action__detail">
                        {t(`terms.node.perDay`, { count: action.uses, field: action.uses })}
                      </Ap>
                    ) : null}
                  </div>
                  {action.isKarmic ? (
                    <div className="node__content__action__details">
                      <Ap className="node__content__action__detail">
                        {`${t(`terms.node.karmaCost`)}: ${action.karmicCost ?? 0}`}
                      </Ap>
                    </div>
                  ) : null}
                </div>
              ))
            : null}
          {nodeElt.effects !== undefined
            ? nodeElt.effects.map((effect) => (
                <div className="node__content__effect" key={`effect-${effect._id}`}>
                  <div className="node__content__effect__title">
                    <Ap className="node__content__effect__title__elt">{effect.title}</Ap>
                    <Ap className="node__content__effect__title__detail">
                      {t(`terms.node.effect`)}
                    </Ap>
                  </div>
                  <div className="node__content__effect__summary">
                    <Ap>{curateStringFormula(effect.summary, effect.formula ?? '', character)}</Ap>
                  </div>
                </div>
              ))
            : null}
        </div>
        {bonusCount > 0 ? (
          <div className="node__content__bonuses">
            <Aul className="node__content__bonuses__list">
              {statBonuses.map(({ value, stat }) => (
                <Ali
                  className="node__content__bonuses__elt"
                  key={`stat-${stat?.stat._id}`}
                >{`+${value} ${stat?.stat.title}`}</Ali>
              ))}
              {skillBonuses.map(({ value, skill }) => (
                <Ali
                  className="node__content__bonuses__elt"
                  key={`skill-${skill?.skill._id}`}
                >{`+${value} ${skill?.skill.title}`}</Ali>
              ))}
              {charParamBonuses.map(({ value, charParam }) => (
                <Ali
                  className="node__content__bonuses__elt"
                  key={`charparam-${charParam?.charParam._id}`}
                >{`+${value} ${charParam?.charParam.title}`}</Ali>
              ))}
            </Aul>
          </div>
        ) : null}
      </div>
    </Quark>
  );
};

export default Node;
