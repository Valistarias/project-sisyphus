import React, { useCallback, type FC } from 'react';
import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';

interface ITest {
  /** The Node element */
  node: any;
  /** The function used to change attributes dynamically */
  updateAttributes: any;
}

const TestReact: FC<ITest> = ({ node, updateAttributes }) => {
  const onClickMore = useCallback(() => {
    updateAttributes({ count: node.attrs.count + 1 });
  }, [node, updateAttributes]);

  return (
    <NodeViewWrapper className="react-component-test">
      <button onClick={onClickMore}>
        {node.attrs.text}
        This button has been clicked {node.attrs.count} times.
      </button>
    </NodeViewWrapper>
  );
};

export default Node.create({
  name: 'reactComponentTest',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      text: {
        default: 'This is a test',
      },
      count: {
        default: 0,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'react-component-test',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['react-component-test', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TestReact);
  },
});

// export default TestReact;
