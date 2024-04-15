import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Quark } from '../quark';
import { type ICuratedNode, type ISkillBranch } from '../types';

import { Node } from './index';

import { classTrim, romanize } from '../utils';

import './nodeTree.scss';

const ranks = 10;
const specBeginRank = 3;

interface INodeTree {
  /** The tree to be displayed */
  tree: Array<{
    branch: ISkillBranch;
    nodes: ICuratedNode[];
  }>;
  /** When a node is clicked */
  onNodeClick?: (id: string) => void;
}

const NodeTree: FC<INodeTree> = ({ tree, onNodeClick = () => {} }) => {
  const { t } = useTranslation();

  const specializationBranches = useMemo(
    () => tree.filter(({ branch }) => branch.title !== '_general'),
    [tree]
  );
  const generalBranch = useMemo(
    () => tree.find(({ branch }) => branch.title === '_general'),
    [tree]
  );

  const rankLinesSpec = useMemo(() => {
    const lines: React.JSX.Element[] = [];
    for (let i = ranks; i >= specBeginRank; i--) {
      const relatedNodes = specializationBranches.map(({ branch, nodes }) => {
        return {
          branch,
          nodes: nodes.filter(({ node }) => node.rank === i),
        };
      });
      const roman = romanize(i);
      lines.push(
        <div
          key={roman as string}
          className={classTrim(`
        node-tree__table__line
        ${i === specBeginRank ? 'node-tree__table__line--first' : ''}
        ${i === ranks ? 'node-tree__table__line--last' : ''}
      `)}
        >
          <div className="node-tree__rank node-tree__cell">{roman}</div>
          {relatedNodes.map(({ branch, nodes }) => (
            <div className="node-tree__cell node-tree__cell--node" key={branch._id}>
              {nodes.map((node) => (
                <Node
                  key={node.node._id}
                  node={node}
                  size="small"
                  onNodeClick={() => {
                    onNodeClick(node.node._id);
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      );
    }
    return lines;
  }, [specializationBranches, onNodeClick]);

  const rankLinesGeneral = useMemo(() => {
    const lines: React.JSX.Element[] = [];
    for (let i = specBeginRank - 1; i >= 1; i--) {
      const relatedNodes = generalBranch?.nodes.filter(({ node }) => node.rank === i) ?? [];
      const roman = romanize(i);
      lines.push(
        <div
          key={roman as string}
          className={classTrim(`
        node-tree__table__line
        ${i === 1 ? 'node-tree__table__line--first' : ''}
        ${i === specBeginRank - 1 ? 'node-tree__table__line--last' : ''}
      `)}
        >
          <div className="node-tree__rank node-tree__cell">{roman}</div>
          <div className="node-tree__cell node-tree__cell--node node-tree__cell--full">
            {relatedNodes.map((node) => (
              <Node
                key={node.node._id}
                node={node}
                onNodeClick={() => {
                  onNodeClick(node.node._id);
                }}
              />
            ))}
          </div>
        </div>
      );
    }
    return lines;
  }, [generalBranch, onNodeClick]);

  return (
    <Quark
      quarkType="div"
      className={classTrim(`
        node-tree
      `)}
    >
      <div className="node-tree__table node-tree__table--specs">
        <div className="node-tree__table__head">
          <div className="node-tree__table__line">
            <div className="node-tree__rank node-tree__cell">{t('terms.node.rank')}</div>
            {specializationBranches.map(({ branch }) => (
              <div className="node-tree__cell" key={branch._id}>
                {branch.title}
              </div>
            ))}
          </div>
        </div>
        <div className="node-tree__table__body">{rankLinesSpec}</div>
      </div>
      <div className="node-tree__table node-tree__table--general">
        <div className="node-tree__table__body">{rankLinesGeneral}</div>
      </div>
    </Quark>
  );
};

export default NodeTree;
