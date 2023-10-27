import React, { useState, type FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { type CharacterMetadata, CompositeDecorator, Editor, EditorState, RichUtils, convertToRaw, type ContentBlock, type ContentState } from 'draft-js';

import { Aa, Ainput, Atitle } from '../../atoms';

import './admin.scss';

const findLinkEntities = (contentBlock: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState): void => {
  contentBlock.findEntityRanges(
    (character: CharacterMetadata) => {
      const entityKey = character.getEntity();
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      );
    },
    callback
  );
};

interface IEditorLink {
  /** The content state of the alert */
  contentState: ContentState
  /** The key used for the entity */
  entityKey: string
  /** The content of the link */
  children: string
}

const Link: FC<IEditorLink> = ({ contentState, entityKey, children }) => {
  const { url } = contentState.getEntity(entityKey).getData();
  return (
    <a href={url} className="test-link">
      {children}
    </a>
  );
};

const Admin: FC = () => {
  const { t } = useTranslation();
  const [editorState, setEditorState] = useState(
    () => {
      const decorator = new CompositeDecorator([
        {
          strategy: findLinkEntities,
          component: Link
        }
      ]);

      return EditorState.createEmpty(decorator);
    }
  );

  const [urlInputVisible, setUrlInputVisible] = useState(false);
  const [urlValue, setUrlInputValue] = useState('');

  const onBoldClick = useCallback(() => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
  }, [editorState]);

  const onLinkClick = useCallback(() => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      setUrlInputVisible(true);
    }
    // setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
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

  const onHandleKeyCommand = useCallback((command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState !== null) {
      setEditorState(newState);
      return 'handled';
    }

    return 'not-handled';
  }, []);

  return (
    <div className="admin">
      <Atitle level={1}>{t('admin.title', { ns: 'pages' })}</Atitle>
      <Aa href="/admin/rulebooks">{t('adminRuleBooks.title', { ns: 'pages' })}</Aa>
      <div className="admin__testEditor">
        <button onClick={onBoldClick}>Bold</button>
        <button onClick={onLinkClick}>Link</button>
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
        <Editor
          editorState={editorState}
          handleKeyCommand={onHandleKeyCommand}
          onChange={setEditorState}
        />
        <button onClick={onTest}>Test</button>
      </div>
    </div>
  );
};

export default Admin;
