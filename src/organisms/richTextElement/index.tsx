import React, { type FC, useState, useCallback, useMemo } from 'react';
import {
  CompositeDecorator,
  EditorState,
  RichUtils,
  convertToRaw,
  Editor,
  getDefaultKeyBinding,
  DefaultDraftBlockRenderMap
} from 'draft-js';

import { Button } from '../../molecules';

import { classTrim } from '../../utils';
import { getSelectionTypeElement } from './utils';

import { Ainput } from '../../atoms';
import { Link, findLinkEntities, Bold, findBoldEntities, Paragraph } from './textElements';

import './richTextElement.scss';

interface IRichTextElement {
  /** Is there raw content (stringified) to be displayed */
  rawStringContent?: string
  /** Is the text element readOnly */
  readOnly?: boolean
}

// const blockRenderMap = Map({
//   unstyled: {
//     element: 'unstyled',
//     wrapper: <Paragraph />
//   }
// });

// const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);

const blockRenderer = (contentBlock) => {
  const type = contentBlock.getType();
  if (type === 'unstyled') {
    return {
      component: Paragraph,
      editable: true
    };
  }
};

const RichTextElement: FC<IRichTextElement> = ({ rawStringContent, readOnly }) => {
  const [editorState, setEditorState] = useState(
    () => {
      const decorator = new CompositeDecorator([
        {
          strategy: findLinkEntities,
          component: Link
        },
        {
          strategy: findBoldEntities,
          component: Bold
        }
      ]);

      return EditorState.createEmpty(decorator);
    }
  );

  const [urlInputVisible, setUrlInputVisible] = useState(false);
  const [urlValue, setUrlInputValue] = useState('');

  const onBoldClick = useCallback(() => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'STRONG'));
  }, [editorState]);

  const onClickLinkBtn = useCallback(() => {
    const selection = editorState.getSelection();
    const selectedTypeElement = getSelectionTypeElement(editorState);
    if (selectedTypeElement === 'LINK') {
      setEditorState(RichUtils.toggleLink(editorState, selection, null));
    } else if (!selection.isCollapsed()) {
      setUrlInputVisible(true);
    }
  }, [editorState]);

  const onTabPress = useCallback((e: React.KeyboardEvent): string | null => {
    if (e.key === 'Tab') {
      e.preventDefault();
      setEditorState(RichUtils.onTab(e, editorState, 3));
      return null;
    }
    return getDefaultKeyBinding(e);
  }, [editorState]);

  const onConfirmLink = useCallback(() => {
    if (urlValue !== '') {
      const contentState = editorState.getCurrentContent();
      const contentStateWithEntity = contentState.createEntity(
        'LINK',
        'MUTABLE',
        { url: urlValue, type: 'item', method: 'hover' }
      );
      const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

      const nextEditorState = EditorState.set(editorState,
        { currentContent: contentStateWithEntity }
      );

      setEditorState(RichUtils.toggleLink(nextEditorState,
        nextEditorState.getSelection(), entityKey
      ));
      setUrlInputValue('');
      setUrlInputVisible(false);
    }
  }, [editorState, urlValue]);

  const onTest = useCallback(() => {
    const raw = convertToRaw(editorState.getCurrentContent());
    console.log('raw', raw);
  }, [editorState]);

  const onHandleKeyCommand = useCallback((command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState !== null) {
      setEditorState(newState);
      return 'handled';
    }

    return 'not-handled';
  }, []);

  const buttonsDom = useMemo(() => {
    if (readOnly !== undefined && readOnly) { return null; }
    return (
      <div className="richTextElt__buttons">
        <button onClick={onBoldClick}>Bold</button>
        <button onClick={onClickLinkBtn}>Link</button>
        {
          urlInputVisible
            ? (
              <>
                <Ainput
                  onChange={(e) => { setUrlInputValue(e.target.value); }}
                  value={urlValue}
                />
                <button onClick={onConfirmLink}>Confirm</button>
              </>
              )
            : null
        }
      </div>
    );
  }, [
    onBoldClick,
    onClickLinkBtn,
    onConfirmLink,
    readOnly,
    urlInputVisible,
    urlValue
  ]);

  return (
    <div
      className={
        classTrim(`
          richTextElt
          ${readOnly !== undefined && readOnly ? ' richTextElt--readOnly' : ''}
        `)
      }
    >
      {buttonsDom}
      <div className="richTextElt__content">
        <Editor
          editorState={editorState}
          handleKeyCommand={onHandleKeyCommand}
          onChange={setEditorState}
          keyBindingFn={onTabPress}
          readOnly={readOnly}
          blockRendererFn={blockRenderer}
        />
      </div>
      { readOnly === undefined || !readOnly ? <Button onClick={onTest}>Test</Button> : null }
    </div>
  );
};

export default RichTextElement;
