import React, { useState, type FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, EditorState, RichUtils } from 'draft-js';

import './admin.scss';

const Admin: FC = () => {
  const { t } = useTranslation();
  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty()
  );

  const onBoldClick = useCallback(() => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
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
      <h1>{t('admin.title', { ns: 'pages' })}</h1>
      <button onClick={onBoldClick}>Bold</button>
      <Editor
        editorState={editorState}
        handleKeyCommand={onHandleKeyCommand}
        onChange={setEditorState}
      />
    </div>
  );
};

export default Admin;
