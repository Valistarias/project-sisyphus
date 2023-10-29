import React, { useCallback, useState, type ReactElement, useMemo } from 'react';
import { type Editor } from '@tiptap/react';

import { Button } from '../../molecules';

import './menuBar.scss';
import { Ainput } from '../../atoms';

interface IMenuBar {
  /** The text Editor */
  editor?: Editor | undefined
  /** Is the text editor with all options ? */
  complete: boolean
}

export const MenuBar = ({ editor, complete }: IMenuBar): ReactElement | null => {
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
    <div className="menubar">
      <div className="menubar__basics">
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          bold
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
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          italic
        </Button>
        <Button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive('paragraph') ? 'is-active' : ''}
        >
          paragraph
        </Button>
      </div>
      {completeOptns}
    </div>
  );
};
