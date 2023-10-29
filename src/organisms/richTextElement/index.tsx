import React, { type FC } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';

import StarterKit from '@tiptap/starter-kit';
import ReactComponent from './test.jsx';

import { classTrim } from '../../utils';

import { MenuBar } from './menuBar';

import './richTextElement.scss';

const extensions = [
  StarterKit.configure({
    // Configure an included extension
    bold: {
      HTMLAttributes: {
        class: 'my-custom-class'
      }
    }
  }),
  ReactComponent
];

const content = `
  <p>
    This is still the text editor you’re used to, but enriched with node views.
  </p>
  <react-component-test count="0"></react-component-test>
  <p>
    Did you see that? That’s a React component. We are really living in the future.
  </p>
`;

interface IRichTextElement {
  /** Is there raw content (stringified) to be displayed */
  rawStringContent?: string
  /** Is the text element readOnly */
  readOnly?: boolean
}

const RichTextElement: FC<IRichTextElement> = ({ rawStringContent, readOnly }) => {
  const editor = useEditor({
    extensions,
    content
  });

  return (
    <div
      className={
        classTrim(`
          richTextElt
          ${readOnly !== undefined && readOnly ? ' richTextElt--readOnly' : ''}
        `)
      }
    >
      <MenuBar editor={editor ?? undefined} />
      <EditorContent editor={editor}/>
    </div>
  );
};

export default RichTextElement;
