import React from 'react';
import {
  useMemo, type FC
} from 'react';

import { useTranslation } from 'react-i18next';

import { Ap } from '../atoms';
import {
  Quark, type IQuarkProps
} from '../quark';

import {
  Button, Node
} from './index';

import type {
  ICuratedNode, ICyberFrameBranch, ISkillBranch
} from '../types';

import {
  classTrim, romanize
} from '../utils';

import './nodeTree.scss';

const ranks = 10;
const specBeginRank = 3;

interface INodeTree {
  /** Is the Tree in admin mode ? */
  isAdmin?: boolean
  /** The tree to be displayed */
  tree: Array<{
    branch: ISkillBranch | ICyberFrameBranch
    nodes: ICuratedNode[]
  }>
  /** When a node is clicked */
  onNodeClick?: (id: string) => void
}

const NodeTree: FC<IQuarkProps<INodeTree>> = ({
  tree, onNodeClick = () => {}, isAdmin = false, className
}) => {
  const {
    t, i18n: translationI18nData
  } = useTranslation();

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
      const relatedNodes = specializationBranches.map(({
        branch, nodes
      }) => ({
        branch,
        nodes: nodes.filter(({ node }) => node.rank === i)
      }));
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
          {relatedNodes.map(({
            branch, nodes
          }, indexNode) => (
            <div className="node-tree__cell node-tree__cell--node" key={branch._id}>
              {nodes.map(node => (
                <Node
                  key={node.node._id}
                  node={node}
                  size="small"
                  menuDirection={
                    relatedNodes.length !== 1 && relatedNodes.length === indexNode + 1
                      ? 'left'
                      : 'right'
                  }
                  menuAnchor={indexNode >= relatedNodes.length - 2 ? 'top' : 'center'}
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
            {relatedNodes.map((node, indexNode) => (
              <Node
                key={node.node._id}
                node={node}
                size="small"
                menuDirection={
                  relatedNodes.length !== 1 && relatedNodes.length === indexNode + 1
                    ? 'left'
                    : 'right'
                }
                menuAnchor="bottom"
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

  if (tree.length <= 1) {
    return (
      <div className="node-tree__table node-tree__table--empty">
        <Ap>{t('nodeTree.empty', { ns: 'components' })}</Ap>
      </div>
    );
  }

  return (
    <Quark
      quarkType="div"
      className={classTrim(`
        node-tree
        ${isAdmin ? 'node-tree--is-admin' : ''}
        ${className ?? ''}
      `)}
    >
      <div className="node-tree__table node-tree__table--specs">
        <div className="node-tree__table__head">
          <div className="node-tree__table__line">
            <div className="node-tree__rank node-tree__cell">{t('terms.node.rank')}</div>
            {specializationBranches.map(({ branch }) => (
              <div className="node-tree__cell" key={branch._id}>
                <Ap lang={translationI18nData.language} className="node-tree__cell__title">
                  {branch.title}
                </Ap>
                {isAdmin
                  ? (
                      <Button
                        href={`/admin/${(branch as ISkillBranch).skill !== undefined ? 'skillbranch' : 'cyberframebranch'}/${branch._id}`}
                        size="small"
                      >
                        {t('terms.general.edit')}
                      </Button>
                    )
                  : null}
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
