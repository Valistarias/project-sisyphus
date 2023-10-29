import React, { type FC, useEffect } from 'react';
import { type Editor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Paragraph from '@tiptap/extension-paragraph';

import { MenuBar } from './menuBar';
import ReactComponent from './test.jsx';

import { classTrim } from '../../utils';

import './richTextElement.scss';

const completeRichTextElementExtentions = [
  StarterKit.configure({
    // Disable an included extension
    paragraph: false,

    // Configure an included extension
    bold: {
      HTMLAttributes: {
        class: 'richTextElt--bold'
      }
    },
    italic: {
      HTMLAttributes: {
        class: 'richTextElt--italic'
      }
    }
  }),
  Paragraph.configure({
    HTMLAttributes: {
      class: 'richTextElt__p ap'
    }
  }),
  ReactComponent
];

const basicRichTextElementExtentions = [
  StarterKit.configure({
    // Disable an included extension
    paragraph: false,

    // Configure an included extension
    bold: {
      HTMLAttributes: {
        class: 'richTextElt--bold'
      }
    },
    italic: {
      HTMLAttributes: {
        class: 'richTextElt--italic'
      }
    }
  }),
  Paragraph.configure({
    HTMLAttributes: {
      class: 'richTextElt__p ap'
    }
  })
];

interface IRichTextElement {
  /** The text Editor */
  editor: Editor | null
  /** Is there raw content (stringified) to be displayed */
  rawStringContent?: string
  /** Is the text element readOnly */
  readOnly?: boolean
  /** Is the text editor with all options ? */
  complete?: boolean
}

const RichTextElement: FC<IRichTextElement> = ({
  editor,
  rawStringContent,
  readOnly = false,
  complete = false
}) => {
  useEffect(() => {
    if (editor === null || rawStringContent === undefined) { return; }
    // https://github.com/ueberdosis/tiptap/issues/3764#issuecomment-1546629928
    setTimeout(() => {
      editor.commands.setContent(rawStringContent);
    });
  }, [editor, rawStringContent]);

  return (
    <div
      className={
        classTrim(`
          richTextElt
          ${readOnly !== undefined && readOnly ? ' richTextElt--readOnly' : ''}
        `)
      }
    >
      {
        !readOnly
          ? (
          <MenuBar editor={editor ?? undefined} complete={complete} />
            )
          : null
      }
      <EditorContent editor={editor} />
    </div>
  );
};

export { RichTextElement, completeRichTextElementExtentions, basicRichTextElementExtentions };
