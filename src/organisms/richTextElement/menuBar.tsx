import React, { useCallback, useState, type ReactElement, useMemo } from 'react';
import { type Editor } from '@tiptap/react';

import { classTrim } from '../../utils';

import { Ainput, Ap } from '../../atoms';
import { Button } from '../../molecules';

import './menuBar.scss';

interface IMenuBar {
  /** The text Editor */
  editor?: Editor | undefined
  /** Is the text editor with all options ? */
  complete: boolean
  /** The className of the menubar */
  className: string
}

export const MenuBar = ({ editor, complete, className }: IMenuBar): ReactElement | null => {
  if (editor === undefined) { return null; }

  const [testBarValue, setTestBarValue] = useState('');
  const [testBarOpened, testBarOpen] = useState(false);

  const onTest = useCallback(() => {
    testBarOpen(true);
  }, []);

  const onConfirmTestBar = useCallback(() => {
    editor.chain().insertContentAt(editor.state.selection.head, {
      type: 'reactComponentTest',
      attrs: { text: testBarValue }
    }).focus().run();
    testBarOpen(false);
    setTestBarValue('');
  }, [editor, testBarValue]);

  const completeOptns = useMemo(() => {
    if (!complete) { return null; }
    return (
      <div className="menubar__advanced">
        <Button
          onClick={() => editor.chain().command(() => {
            onTest();

            return true;
          }).run()}
        >
          test element
        </Button>
        { testBarOpened
          ? (
            <div className="menubar__advanced__testbar">
              <Ainput
                type="text"
                placeholder="Text"
                onChange={(e) => { setTestBarValue(e.target.value); }}
                value={testBarValue}
              />
              <Button
                onClick={onConfirmTestBar}
              >confirm
              </Button>
            </div>
            )
          : null}
      </div>
    );
  }, [
    complete,
    editor,
    onConfirmTestBar,
    onTest,
    testBarOpened,
    testBarValue
  ]);

  return (
    <div className={
      classTrim(`
        menubar
        ${className ?? ''}
      `)
    }>
      <div className="menubar__basics">
        <div className="menubar__basics__marks">
          <Ap className="menubar__titles">Texts</Ap>
          <Button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={
              !editor.can()
                .chain()
                .focus()
                .toggleBold()
                .run()
            }
            active={editor.isActive('bold')}
            className="menubar__basics__marks__bold"
          >
            b
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={
              !editor.can()
                .chain()
                .focus()
                .toggleItalic()
                .run()
            }
            active={editor.isActive('italic')}
            className="menubar__basics__marks__italic"
          >
            i
          </Button>
        </div>
        <div className="menubar__basics__nodes">
          <Ap className="menubar__titles">Paragraphs</Ap>
          <Button
              onClick={() => editor.chain().focus().setParagraph().run()}
              active={editor.isActive('paragraph')}
            >
            p
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
          >
            h1
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
          >
            h2
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
          >
            h3
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          >
            list
          </Button>
        </div>
        <div className="menubar__basics__nodes">
          <Ap className="menubar__titles">Table</Ap>
          <Button
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            New table
          </Button>
          <Button
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            Delete table
          </Button>
          <Button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            New Col.
          </Button>
          <Button
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            Del. Col.
          </Button>
          <Button
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            New Row
          </Button>
          <Button
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            Del. Row
          </Button>
          <Button
            onClick={() => editor.chain().focus().mergeCells().run()}
          >
            Merge
          </Button>
          <Button
            onClick={() => editor.chain().focus().splitCell().run()}
          >
            Split
          </Button>
        </div>
      </div>
      {/* {completeOptns} */}
    </div>
  );
};
