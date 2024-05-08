import React, { useCallback, useMemo, useState, type FC, type ReactNode } from 'react';

import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ali, Ap, Atitle, Aul } from '../../atoms';
import { Button, NodeTree } from '../../molecules';
import { type ICuratedCyberFrame, type ICuratedNode, type ICyberFrameBranch } from '../../types';
import { RichTextElement } from '../richTextElement';

import { classTrim } from '../../utils';

import './characterCreation.scss';

interface ICharacterCreationStep1 {
  /** When the user click send and the data is send perfectly */
  onSubmitCyberFrame: (id: string) => void;
}

const CharacterCreationStep1: FC<ICharacterCreationStep1> = ({ onSubmitCyberFrame }) => {
  const { t } = useTranslation();
  const { cyberFrames } = useGlobalVars();

  const [openedCFrame, setOpenedCFrame] = useState<ICuratedCyberFrame | null>(null);
  const [detailsOpened, setDetailsOpened] = useState<boolean>(false);
  const [nodeTreeDisplayed, setNodeTreeDisplayed] = useState<boolean>(false);

  const onOpenDetails = useCallback(
    (id: string) => {
      const foundCFrame = cyberFrames.find(({ cyberFrame }) => cyberFrame._id === id);
      if (foundCFrame !== undefined) {
        setOpenedCFrame(foundCFrame);
      }
    },
    [cyberFrames]
  );

  const detailsBlock = useMemo(() => {
    if (openedCFrame === null) {
      return <div className="characterCreation-step1__detail-block" />;
    }
    const { cyberFrame } = openedCFrame;
    const branches = cyberFrame.branches.filter(
      ({ cyberFrameBranch }) => cyberFrameBranch.title !== '_general'
    );
    const tempTree: Record<
      string,
      {
        branch: ICyberFrameBranch;
        nodes: ICuratedNode[];
      }
    > = {};
    cyberFrame.branches?.forEach(({ cyberFrameBranch }) => {
      tempTree[cyberFrameBranch._id] = {
        branch: cyberFrameBranch,
        nodes: cyberFrameBranch.nodes,
      };
    });
    return (
      <div className="characterCreation-step1__detail-block">
        <div className="characterCreation-step1__detail-block__line">
          <div className="characterCreation-step1__detail-block__main">
            <Atitle level={2} className="characterCreation-step1__detail-block__title">
              {cyberFrame.title}
            </Atitle>
            {nodeTreeDisplayed ? (
              <NodeTree
                className="characterCreation-step1__detail-block__tree"
                tree={Object.values(tempTree)}
              />
            ) : (
              <>
                <RichTextElement
                  className="characterCreation-step1__detail-block__text"
                  rawStringContent={cyberFrame.summary}
                  readOnly
                />
                <Atitle level={3}>
                  {t('characterCreation.step1.cFramebranches', { ns: 'components' })}
                </Atitle>
                <Aul noPoints className="characterCreation-step1__detail-block__branches">
                  {branches.map(({ cyberFrameBranch }) => (
                    <Ali
                      key={cyberFrameBranch._id}
                      className="characterCreation-step1__detail-block__branches__branch"
                    >
                      <Atitle level={4}>{cyberFrameBranch.title}</Atitle>
                      <RichTextElement rawStringContent={cyberFrameBranch.summary} readOnly />
                    </Ali>
                  ))}
                </Aul>
              </>
            )}

            <Button
              className="characterCreation-step1__detail-block__btn"
              onClick={() => {
                setNodeTreeDisplayed((prev) => !prev);
              }}
            >
              {t(
                nodeTreeDisplayed
                  ? 'characterCreation.step1.cFrameDetailsBtn'
                  : 'characterCreation.step1.cFrameTree',
                { ns: 'components' }
              )}
            </Button>
          </div>
        </div>
        <div className="characterCreation-step1__detail-block__btns">
          <Button
            theme="afterglow"
            size="large"
            onClick={() => {
              onSubmitCyberFrame(cyberFrame._id);
              setDetailsOpened(false);
            }}
          >
            {t('characterCreation.step1.chooseCta', { ns: 'components' })}
          </Button>
          <Button
            theme="text-only"
            size="large"
            onClick={() => {
              setDetailsOpened(false);
            }}
          >
            {t('characterCreation.step1.return', { ns: 'components' })}
          </Button>
        </div>
      </div>
    );
  }, [openedCFrame, t, nodeTreeDisplayed, onSubmitCyberFrame]);

  const cyberFrameList = useMemo(() => {
    const cFrameElts: ReactNode[] = [];
    cyberFrames.forEach((cyberFrameElt) => {
      const { cyberFrame } = cyberFrameElt;

      cFrameElts.push(
        <div
          key={cyberFrame._id}
          className={classTrim(`
            characterCreation-step1__cFrame
            ${openedCFrame?.cyberFrame._id === cyberFrame._id && detailsOpened ? 'characterCreation-step1__cFrame--opened' : ''}
          `)}
        >
          <Atitle level={2}>{cyberFrame.title}</Atitle>
          <RichTextElement
            className="characterCreation-step1__cFrame__text"
            rawStringContent={cyberFrame.summary}
            readOnly
          />
          <Button
            theme="afterglow"
            className="characterCreation-step1__cFrame__btn"
            onClick={() => {
              onOpenDetails(cyberFrame._id);
              setDetailsOpened(true);
            }}
          >
            {t('characterCreation.step1.cFrameDetailsBtn', { ns: 'components' })}
          </Button>
        </div>
      );
    });
    return cFrameElts;
  }, [cyberFrames, openedCFrame, detailsOpened, onOpenDetails, t]);

  return (
    <div
      className={classTrim(`
      characterCreation-step1
        ${detailsOpened ? 'characterCreation-step1--details' : ''}
      `)}
    >
      <div className="characterCreation-step1__details">{detailsBlock}</div>
      <Ap className="characterCreation-step1__text">
        {t('characterCreation.step1.text', { ns: 'components' })}
      </Ap>
      <div className="characterCreation-step1__list">{cyberFrameList}</div>
    </div>
  );
};

export default CharacterCreationStep1;
