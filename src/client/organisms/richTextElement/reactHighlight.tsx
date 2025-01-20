import React, { type FC } from 'react';

import {
  mergeAttributes, Node,
  type NodeViewProps
} from '@tiptap/core';
import {
  NodeViewWrapper, ReactNodeViewRenderer
} from '@tiptap/react';

import { Highlight } from '../../molecules';

const HighlightReact: FC<NodeViewProps> = ({ node }) => (
  <NodeViewWrapper as="span">
    <Highlight id={node.attrs.idElt} type={node.attrs.typeElt}>
      {node.attrs.textElt}
    </Highlight>
  </NodeViewWrapper>
);

export default Node.create({
  name: 'reactComponentHighlight',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      idElt: { default: '' },
      typeElt: { default: 'notion' },
      textElt: { default: 'Link' }
    };
  },

  parseHTML() {
    return [{ tag: 'react-component-highlight' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['react-component-highlight', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(HighlightReact);
  }
});
