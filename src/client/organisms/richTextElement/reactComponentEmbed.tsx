import React, { type FC } from 'react';

import { mergeAttributes, Node, type NodeViewProps } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';

import { EmbedNotion } from '../../molecules';

const EmbedReact: FC<NodeViewProps> = ({ node }) => (
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
  },
});
