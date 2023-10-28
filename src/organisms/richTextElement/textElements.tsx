import React, { type FC } from 'react';
import { EditorBlock, type CharacterMetadata, type ContentBlock, type ContentState } from 'draft-js';

import { Aa } from '../../atoms';

interface IEditorInlineElt {
  /** The content state of the entity */
  contentState: ContentState
  /** The key used for the entity */
  entityKey: string
  /** The content of the entity */
  children: string
}

interface IEditorBlockElt {
  /** The content state of the entity */
  contentState: ContentState
  /** The key used for the entity */
  block: any
  /** The content of the entity */
  children: string
}

// Link Elements --------------------------------------------------

export const Link: FC<IEditorInlineElt> = ({ contentState, entityKey, children }) => {
  const { url } = contentState.getEntity(entityKey).getData();
  return (
    <Aa href={url} className="richTextElt__link" target="_blank">
      {children}
    </Aa>
  );
};

export const findLinkEntities = (contentBlock: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState): void => {
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

// Bold Elements --------------------------------------------------

export const Bold: FC<IEditorInlineElt> = ({ contentState, entityKey, children }) => (
  <b className="richTextElt__bold">
    {children}
  </b>
);

export const findBoldEntities = (contentBlock: ContentBlock, callback: (start: number, end: number) => void, contentState: ContentState): void => {
  contentBlock.findStyleRanges(
    (character: CharacterMetadata) => character.hasStyle('STRONG'),
    callback
  );
};

// Paragraph Elements --------------------------------------------------

export const Paragraph: FC<IEditorBlockElt> = ({ contentState, children }) => {
  return (
    <div className="richTextElt__paragraph">
      <EditorBlock />
      {children}
    </div>
  );
};
