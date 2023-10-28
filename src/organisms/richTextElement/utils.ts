import { type EditorState } from 'draft-js';

/**
 * Function returns collection of currently selected blocks.
 */
export const getSelectedBlocksMap = (editorState: EditorState): any => {
  const selectionState = editorState.getSelection();
  const contentState = editorState.getCurrentContent();
  const startKey = selectionState.getStartKey();
  const endKey = selectionState.getEndKey();
  const blockMap = contentState.getBlockMap();
  return blockMap
    .toSeq()
    .skipUntil((_, k) => k === startKey)
    .takeUntil((_, k) => k === endKey)
    .concat([[endKey, blockMap.get(endKey)]]);
};

/**
 * Function returns collection of currently selected blocks.
 */
export const getSelectedBlocksList = (editorState: EditorState): any => {
  return getSelectedBlocksMap(editorState).toList();
};

/**
 * Function returns the first selected block.
 */
export const getSelectedBlock = (editorState: EditorState): any => {
  if (editorState !== undefined) {
    return getSelectedBlocksList(editorState).get(0);
  }
  return undefined;
};

/**
 * If all currently selected blocks are of same type the function will return their type,
 * Else it will return empty string.
 */
export const getSelectedBlocksType = (editorState: EditorState): any => {
  const blocks = getSelectedBlocksList(editorState);
  const hasMultipleBlockTypes: boolean = blocks.some(
    block => block.type !== blocks.get(0).type
  );
  if (!hasMultipleBlockTypes) {
    return blocks.get(0).type;
  }
  return undefined;
};

/**
 * This function will return the entity applicable to whole of current selection.
 * An entity can not span multiple blocks.
 */
export const getSelectionEntity = (editorState: EditorState): any => {
  let entity;
  const selection = editorState.getSelection();
  let start = selection.getStartOffset();
  let end = selection.getEndOffset();
  if (start === end && start === 0) {
    end = 1;
  } else if (start === end) {
    start -= 1;
  }
  const block = getSelectedBlock(editorState);

  for (let i = start; i < end; i += 1) {
    const currentEntity: string | null = block.getEntityAt(i);
    if (currentEntity === null || currentEntity === '') {
      entity = undefined;
      break;
    }
    if (i === start) {
      entity = currentEntity;
    } else if (entity !== currentEntity) {
      entity = undefined;
      break;
    }
  }
  return entity;
};

export const getSelectionTypeElement = (editorState: EditorState): any => {
  const contentState = editorState.getCurrentContent();
  const entityKey = getSelectionEntity(editorState);
  if (entityKey !== undefined) {
    return contentState.getEntity(entityKey).getType();
  }
  return null;
};
