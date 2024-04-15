import React, { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Atable, Atbody, Atd, Ath, Athead, Atr } from '../atoms';
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

const NodeTree: FC<INodeTree> = ({ tree, onNodeClick }) => {
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
      console.log('roman', roman);
      lines.push(
        <Atr className="node-tree__table__line">
          <Atd className="node-tree__rank">{roman}</Atd>
          {relatedNodes.map(({ branch, nodes }) => (
            <Atd className="node-tree__cell node-tree__cell--node" key={branch._id}>
              {nodes.map((node) => (
                <Node
                  key={node.node._id}
                  node={node}
                  // onNodeClick={() => {
                  //   navigate(`/admin/node/${node.node._id}`);
                  // }}
                />
              ))}
            </Atd>
          ))}
        </Atr>
      );
    }
    return lines;
  }, [specializationBranches]);

  const rankLinesGeneral = useMemo(() => {
    const lines: React.JSX.Element[] = [];
    for (let i = specBeginRank - 1; i >= 1; i--) {
      const relatedNodes = generalBranch?.nodes.filter(({ node }) => node.rank === i) ?? [];
      const roman = romanize(i);
      console.log('roman', roman);
      lines.push(
        <Atr className="node-tree__table__line">
          <Atd className="node-tree__rank node-tree__cell">{roman}</Atd>
          <Atd className="node-tree__cell node-tree__cell--node">
            {relatedNodes.map((node) => (
              <Node
                key={node.node._id}
                node={node}
                // onNodeClick={() => {
                //   navigate(`/admin/node/${node.node._id}`);
                // }}
              />
            ))}
          </Atd>
        </Atr>
      );
    }
    return lines;
  }, [generalBranch]);

  return (
    <Quark
      quarkType="div"
      className={classTrim(`
        node-tree
      `)}
    >
      <Atable className="node-tree__table">
        <Athead className="node-tree__table__head">
          <Atr className="node-tree__table__line">
            <Ath className="node-tree__rank">{t('terms.node.rank')}</Ath>
            {specializationBranches.map(({ branch }) => (
              <Ath className="node-tree__cell" key={branch._id}>
                {branch.title}
              </Ath>
            ))}
          </Atr>
        </Athead>
        <Atbody className="node-tree__table__body">{rankLinesSpec}</Atbody>
      </Atable>
      <Atable className="node-tree__table">
        <Atbody className="node-tree__table__body">{rankLinesGeneral}</Atbody>
      </Atable>
    </Quark>
  );
};

export default NodeTree;
