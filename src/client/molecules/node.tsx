import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../providers';

import { Abutton, Ali, AnodeIcon, Ap, Atitle, Aul } from '../atoms';
import { RichTextElement } from '../organisms';
import { Quark } from '../quark';
import {
  type ICuratedCharParam,
  type ICuratedNode,
  type ICuratedSkill,
  type ICuratedStat,
} from '../types';

import { classTrim } from '../utils';

import './node.scss';

interface INode {
  /** The Node to display */
  node: ICuratedNode;
  /** When the node is clicked */
  onNodeClick?: () => void;
}

const Node: FC<INode> = ({ node, onNodeClick }) => {
  const { t } = useTranslation();
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

  return (
    <Quark
      quarkType="div"
      className={classTrim(`
        node
      `)}
    >
      <Abutton type="button" onClick={onNodeClick} className="node__icon">
        <AnodeIcon type={nodeElt.icon} />
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
            <RichTextElement
              className="node__content__main__text"
              rawStringContent={content.summary}
              readOnly
            />
          </div>
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
