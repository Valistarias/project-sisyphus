import React, { type FC, useEffect } from 'react';
import { type Editor, EditorContent, mergeAttributes } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Paragraph from '@tiptap/extension-paragraph';
import Heading from '@tiptap/extension-heading';

import { MenuBar } from './menuBar';
import ReactComponent from './test';

import { Alabel } from '../../atoms';

import { classTrim } from '../../utils';

import './../../atoms/atitle.scss';
import './richTextElement.scss';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';

const completeRichTextElementExtentions = [
  StarterKit.configure({
    // Disable an included extension
    paragraph: false,
    heading: false,
    code: false,

    // Configure an included extension
    bold: {
      HTMLAttributes: {
        class: 'richTextElt--bold',
      },
    },
    italic: {
      HTMLAttributes: {
        class: 'richTextElt--italic',
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: 'aul',
      },
    },
    listItem: {
      HTMLAttributes: {
        class: 'ali',
      },
    },
  }),
  Paragraph.configure({
    HTMLAttributes: {
      class: 'ap',
    },
  }),
  Table.configure({
    HTMLAttributes: {
      class: 'atable',
    },
  }),
  TableRow.configure({
    HTMLAttributes: {
      class: 'atr',
    },
  }),
  TableHeader.configure({
    HTMLAttributes: {
      class: 'ath',
    },
  }),
  TableCell.configure({
    HTMLAttributes: {
      class: 'atd',
    },
  }),
  Heading.configure({ levels: [1, 2, 3] }).extend({
    renderHTML({ node, HTMLAttributes }) {
      const hasLevel = this.options.levels.includes(node.attrs.level);
      const level = hasLevel ? node.attrs.level : this.options.levels[0];

      return [
        `h${level}`,
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          class: `atitle atitle--h${level}`,
        }),
        0,
      ];
    },
  }),
  ReactComponent,
];

const basicRichTextElementExtentions = [
  StarterKit.configure({
    // Disable an included extension
    paragraph: false,
    heading: false,

    // Configure an included extension
    bold: {
      HTMLAttributes: {
        class: 'richTextElt--bold',
      },
    },
    italic: {
      HTMLAttributes: {
        class: 'richTextElt--italic',
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: 'aul',
      },
    },
    listItem: {
      HTMLAttributes: {
        class: 'ali',
      },
    },
  }),
  Paragraph.configure({
    HTMLAttributes: {
      class: 'ap',
    },
  }),
  Table.configure({
    HTMLAttributes: {
      class: 'atable',
    },
  }),
  TableRow.configure({
    HTMLAttributes: {
      class: 'atr',
    },
  }),
  TableHeader.configure({
    HTMLAttributes: {
      class: 'ath',
    },
  }),
  TableCell.configure({
    HTMLAttributes: {
      class: 'atd',
    },
  }),
  Heading.configure({ levels: [1, 2, 3] }).extend({
    renderHTML({ node, HTMLAttributes }) {
      const hasLevel = this.options.levels.includes(node.attrs.level);
      const level = hasLevel ? node.attrs.level : this.options.levels[0];

      return [
        `h${level}`,
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          class: `atitle atitle--h${level}`,
        }),
        0,
      ];
    },
  }),
];

interface IRichTextElement {
  /** The text Editor */
  editor: Editor | null;
  /** Is there raw content (stringified) to be displayed */
  rawStringContent?: string;
  /** The title of the editor, if any */
  label?: string;
  /** Is the text element readOnly */
  readOnly?: boolean;
  /** Is the text editor with all options ? */
  complete?: boolean;
  /** Is the text editor small in height ? */
  small?: boolean;
}

const RichTextElement: FC<IRichTextElement> = ({
  editor,
  label,
  rawStringContent,
  readOnly = false,
  complete = false,
  small = false,
}) => {
  useEffect(() => {
    if (editor === null || rawStringContent === undefined) {
      return;
    }
    // https://github.com/ueberdosis/tiptap/issues/3764#issuecomment-1546629928
    setTimeout(() => {
      editor.commands.setContent(rawStringContent);
    });
  }, [editor, rawStringContent]);

  return (
    <div
      className={classTrim(`
          richTextElt
          ${small ? 'richTextElt--small' : ''}
          ${readOnly !== undefined && readOnly ? ' richTextElt--readOnly' : ''}
        `)}
    >
      {label !== undefined ? <Alabel>{label}</Alabel> : null}
      {!readOnly ? (
        <MenuBar editor={editor ?? undefined} complete={complete} className="richTextElt__menu" />
      ) : null}
      <EditorContent
        editor={editor}
        className="richTextElt__editor"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
    </div>
  );
};

export { RichTextElement, completeRichTextElementExtentions, basicRichTextElementExtentions };
