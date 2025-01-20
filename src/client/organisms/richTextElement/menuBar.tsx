import React, {
  useCallback, useMemo, useState, type FC
} from 'react';

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  useApi, useSystemAlerts
} from '../../providers';

import { Ap } from '../../atoms';
import {
  Button, Input, SmartSelect, type IGroupedOption
} from '../../molecules';
import { Alert } from '../index';

import type { ICuratedNotion } from '../../types';
import type { Editor } from '@tiptap/react';

import { classTrim } from '../../utils';

import './menuBar.scss';

interface IMenuBar {
  /** The text Editor */
  editor?: Editor | undefined
  /** Is the text editor with all options ? */
  complete: boolean
  /** The className of the menubar */
  className?: string
  /** The RuleBookId, if there is one */
  ruleBookId?: string
}

export const MenuBar: FC<IMenuBar> = ({
  editor, complete, className, ruleBookId
}) => {
  const { t } = useTranslation();
  const { api } = useApi();
  const {
    createAlert, getNewId
  } = useSystemAlerts();

  const [notions, setNotions] = useState<ICuratedNotion[]>([]);

  // Embed Tool
  const [embedBarOpened, embedBarOpen] = useState(false);
  const [selectedEmbed, setSelectedEmbed] = useState<string | null>(null);

  // Highlight Tool
  const [highlightOpened, highlightOpen] = useState(false);
  const [textHighlight, setTextHighlight] = useState<string>('');
  const [selectedHighlight, setSelectedHighlight]
  = useState<string | null>(null);

  const {
    control
  } = useForm();

  const embedSelectChoices = useMemo(
    () =>
      notions.map(({ notion }) => ({
        value: notion._id,
        label: notion.title
      })),
    [notions]
  );

  const highlightSelectChoices = useMemo<IGroupedOption>(() => {
    const notionOptions = notions.map(({ notion }) => ({
      value: notion._id,
      label: notion.title
    }));

    return {
      label: t('richTextElement.highlight.highlightNotionCat', { ns: 'components' }),
      cat: 'notions',
      options: notionOptions
    };
  }, [notions, t]);

  const callNotions = useCallback(
    async (): Promise<boolean> =>
      await new Promise((resolve) => {
        if (api === undefined) {
          resolve(false);

          return;
        }

        api.notions
          .getAllByRuleBook({ ruleBookId })
          .then((notions) => {
            resolve(true);
            setNotions(notions);
          })
          .catch(() => {
            const newId = getNewId();
            createAlert({
              key: newId,
              dom: (
                <Alert key={newId} id={newId} timer={5}>
                  <Ap>{t('serverErrors.CYPU-301')}</Ap>
                </Alert>
              )
            });
            resolve(false);
          });
      }),
    [
      api,
      createAlert,
      getNewId,
      ruleBookId,
      t
    ]
  );

  const onEmbed = useCallback(() => {
    callNotions().then(
      (isDone) => {
        if (isDone) {
          embedBarOpen(true);
        }
      },
      () => undefined
    );
  }, [callNotions]);

  const onHighlight = useCallback(() => {
    callNotions().then(
      (isDone) => {
        if (isDone) {
          highlightOpen(true);
        }
      },
      () => undefined
    );
  }, [callNotions]);

  const onConfirmEmbedBar = useCallback(() => {
    if (editor === undefined || selectedEmbed === null) {
      return null;
    }
    editor
      .chain()
      .insertContentAt(editor.state.selection.head, {
        type: 'reactComponentEmbed',
        attrs: { notionId: selectedEmbed }
      })
      .focus()
      .run();
    embedBarOpen(false);
    setSelectedEmbed(null);
  }, [editor, selectedEmbed]);

  const onConfirmHighlightBar = useCallback(() => {
    if (editor === undefined || selectedHighlight === null) {
      return null;
    }

    editor
      .chain()
      .insertContentAt(editor.state.selection.head, {
        type: 'reactComponentHighlight',
        attrs: {
          idElt: selectedHighlight,
          textElt: textHighlight !== '' ? textHighlight : null,
          typeElt: highlightSelectChoices.cat
        }
      })
      .focus()
      .run();
    highlightOpen(false);
    setSelectedHighlight(null);
  }, [
    editor,
    selectedHighlight,
    textHighlight,
    highlightSelectChoices
  ]);

  if (editor === undefined) {
    return null;
  }

  return (
    <div
      className={classTrim(`
        menubar
        ${className ?? ''}
      `)}
    >
      <div className="menubar__categories">
        <div className="menubar__categories__marks">
          <Ap className="menubar__titles">
            {t('richTextElement.textTitle', { ns: 'components' })}
          </Ap>
          <Button
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            className="menubar__categories__marks__bold"
          >
            {t('richTextElement.bold', { ns: 'components' })}
          </Button>
          <Button
            size="small"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            className="menubar__categories__marks__italic"
          >
            {t('richTextElement.italic', { ns: 'components' })}
          </Button>
        </div>
        <div className="menubar__categories__nodes">
          <Ap className="menubar__titles">
            {t('richTextElement.textParagraph', { ns: 'components' })}
          </Ap>
          <Button
            size="small"
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive('paragraph')}
          >
            {t('richTextElement.paragraph', { ns: 'components' })}
          </Button>
          <Button
            size="small"
            onClick={
              () => editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            active={editor.isActive('heading', { level: 1 })}
          >
            {t('richTextElement.h1', { ns: 'components' })}
          </Button>
          <Button
            size="small"
            onClick={
              () => editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive('heading', { level: 2 })}
          >
            {t('richTextElement.h2', { ns: 'components' })}
          </Button>
          <Button
            size="small"
            onClick={
              () => editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
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
        <div className="menubar__categories__tables">
          <Ap className="menubar__titles">
            {t('richTextElement.textTable', { ns: 'components' })}
          </Ap>
          <Button
            size="small"
            onClick={() =>
              editor.chain().focus().insertTable({
                rows: 3, cols: 3, withHeaderRow: true
              }).run()}
          >
            {t('richTextElement.table.new', { ns: 'components' })}
          </Button>
          <Button size="small" onClick={() => editor.chain().focus().deleteTable().run()}>
            {t('richTextElement.table.del', { ns: 'components' })}
          </Button>
          <Button size="small" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            {t('richTextElement.table.newcol', { ns: 'components' })}
          </Button>
          <Button size="small" onClick={() => editor.chain().focus().deleteColumn().run()}>
            {t('richTextElement.table.delcol', { ns: 'components' })}
          </Button>
          <Button size="small" onClick={() => editor.chain().focus().addRowAfter().run()}>
            {t('richTextElement.table.newrow', { ns: 'components' })}
          </Button>
          <Button size="small" onClick={() => editor.chain().focus().deleteRow().run()}>
            {t('richTextElement.table.delrow', { ns: 'components' })}
          </Button>
          <Button size="small" onClick={() => editor.chain().focus().mergeCells().run()}>
            {t('richTextElement.table.merge', { ns: 'components' })}
          </Button>
          <Button size="small" onClick={() => editor.chain().focus().splitCell().run()}>
            {t('richTextElement.table.split', { ns: 'components' })}
          </Button>
        </div>
        <div className="menubar__categories__highlight">
          <Ap className="menubar__titles">
            {t('richTextElement.textHighlight', { ns: 'components' })}
          </Ap>
          <Button
            size="small"
            onClick={() =>
              editor
                .chain()
                .command(() => {
                  onHighlight();

                  return true;
                })
                .run()}
            active={editor.isActive('reactComponentHighlight')}
          >
            {t('richTextElement.highlight.button', { ns: 'components' })}
          </Button>
          {highlightOpened
            ? (
                <div className="menubar__categories__highlight__highlightbar">
                  <SmartSelect
                    inputName="category"
                    control={control}
                    options={highlightSelectChoices.options}
                    onChange={(choice) => {
                      setTextHighlight(choice.label);
                      setSelectedHighlight(String(choice.value));
                    }}
                  />
                  <Input
                    inputName="highlight"
                    control={control}
                    type="text"
                    placeholder={t('richTextElement.highlight.title', { ns: 'components' })}
                    onChange={(e) => {
                      setTextHighlight(e.target.value);
                    }}
                  />
                  <Button onClick={onConfirmHighlightBar}>
                    {t('richTextElement.highlight.confirm', { ns: 'components' })}
                  </Button>
                  <Button
                    onClick={() => {
                      highlightOpen(false);
                    }}
                  >
                    {t('richTextElement.highlight.abort', { ns: 'components' })}
                  </Button>
                </div>
              )
            : null}
        </div>
        {complete
          ? (
              <div className="menubar__categories__embeds">
                <Ap className="menubar__titles">
                  {t('richTextElement.textEmbed', { ns: 'components' })}
                </Ap>
                <Button
                  onClick={() =>
                    editor
                      .chain()
                      .command(() => {
                        onEmbed();

                        return true;
                      })
                      .run()}
                  active={editor.isActive('reactComponentEmbed')}
                >
                  {t('richTextElement.notion.button', { ns: 'components' })}
                </Button>
                {embedBarOpened
                  ? (
                      <div className="menubar__categories__embeds__embedbar">
                        <SmartSelect
                          inputName="embed"
                          control={control}
                          options={embedSelectChoices}
                          onChange={(e) => {
                            setSelectedEmbed(String(e.value));
                          }}
                        />
                        <Button onClick={onConfirmEmbedBar}>
                          {t('richTextElement.notion.confirm', { ns: 'components' })}
                        </Button>
                        <Button
                          onClick={() => {
                            embedBarOpen(false);
                          }}
                        >
                          {t('richTextElement.notion.abort', { ns: 'components' })}
                        </Button>
                      </div>
                    )
                  : null}
              </div>
            )
          : null}
      </div>
    </div>
  );
};
