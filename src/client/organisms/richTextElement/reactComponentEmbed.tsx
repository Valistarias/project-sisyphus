import React, { type FC } from 'react';

import {
  mergeAttributes, Node
} from '@tiptap/core';
import {
  NodeViewWrapper, ReactNodeViewRenderer
} from '@tiptap/react';

import { EmbedNotion } from '../../molecules';

interface ITest {
  /** The Node element */
  node: unknown
}

const EmbedReact: FC<ITest> = ({ node }) => (
  <NodeViewWrapper className="react-component-embed">
    <EmbedNotion notionId={node.attrs.notionId} />
  </NodeViewWrapper>
);

export default Node.create({
  name: 'reactComponentEmbed',
  group: 'block',
  atom: true,

  addAttributes() {
    return { notionId: { default: '' } };
  },

  parseHTML() {
    return [{ tag: 'react-component-embed' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['react-component-embed', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedReact);
  }
});
