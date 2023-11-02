import React, { useCallback, useState, type FC, useMemo } from 'react';
import { type Editor } from '@tiptap/react';

import { useTranslation } from 'react-i18next';

import { classTrim } from '../../utils';

import { Ap } from '../../atoms';
import { Button, Input } from '../../molecules';

import './menuBar.scss';

interface IMenuBar {
  /** The text Editor */
  editor?: Editor | undefined
  /** Is the text editor with all options ? */
  complete: boolean
  /** The className of the menubar */
  className: string
}

export const MenuBar: FC<IMenuBar> = ({ editor, complete, className }) => {
  const { t } = useTranslation();

  const [testBarValue, setTestBarValue] = useState('');
  const [testBarOpened, testBarOpen] = useState(false);

  const onTest = useCallback(() => {
    testBarOpen(true);
  }, []);

  const onConfirmTestBar = useCallback(() => {
    if (editor === undefined) { return null; }
    editor.chain().insertContentAt(editor.state.selection.head, {
      type: 'reactComponentTest',
      attrs: { text: testBarValue }
    }).focus().run();
    testBarOpen(false);
    setTestBarValue('');
  }, [editor, testBarValue]);

  const completeOptns = useMemo(() => {
    if (!complete || editor === undefined) { return null; }
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
              <Input
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

  if (editor === undefined) { return null; }

  return (
    <div className={
      classTrim(`
        menubar
        ${className ?? ''}
      `)
    }>
      <div className="menubar__basics">
        <div className="menubar__basics__marks">
          <Ap className="menubar__titles">{t('richTextElement.textTitle', { ns: 'components' })}</Ap>
          <Button
            size="small"
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
            {t('richTextElement.bold', { ns: 'components' })}
          </Button>
          <Button
            size="small"
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
            {t('richTextElement.italic', { ns: 'components' })}
          </Button>
        </div>
        <div className="menubar__basics__nodes">
          <Ap className="menubar__titles">Paragraphs</Ap>
          <Button
              size="small"
              onClick={() => editor.chain().focus().setParagraph().run()}
              active={editor.isActive('paragraph')}
            >
            {t('richTextElement.paragraph', { ns: 'components' })}
          </Button>
          <Button
            size="small"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
          >
            {t('richTextElement.h1', { ns: 'components' })}
          </Button>
          <Button
            size="small"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
          >
            {t('richTextElement.h2', { ns: 'components' })}
          </Button>
          <Button
            size="small"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
          >
            {t('richTextElement.h3', { ns: 'components' })}
          </Button>
          <Button
            size="small"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          >
            {t('richTextElement.list', { ns: 'components' })}
          </Button>
        </div>
        <div className="menubar__basics__nodes">
          <Ap className="menubar__titles">Table</Ap>
          <Button
            size="small"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            {t('richTextElement.table.new', { ns: 'components' })}
          </Button>
          <Button
            size="small"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            {t('richTextElement.table.del', { ns: 'components' })}
          </Button>
          <Button
            size="small"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            {t('richTextElement.table.newcol', { ns: 'components' })}
          </Button>
          <Button
            size="small"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            {t('richTextElement.table.delcol', { ns: 'components' })}
          </Button>
          <Button
            size="small"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            {t('richTextElement.table.newrow', { ns: 'components' })}
          </Button>
          <Button
            size="small"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            {t('richTextElement.table.delrow', { ns: 'components' })}
          </Button>
          <Button
            size="small"
            onClick={() => editor.chain().focus().mergeCells().run()}
          >
            {t('richTextElement.table.merge', { ns: 'components' })}
          </Button>
          <Button
            size="small"
            onClick={() => editor.chain().focus().splitCell().run()}
          >
            {t('richTextElement.table.split', { ns: 'components' })}
          </Button>
        </div>
      </div>
      {/* {completeOptns} */}
    </div>
  );
};
