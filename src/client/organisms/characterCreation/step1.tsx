import React, {
  useCallback, useMemo, useState, type FC, type ReactNode
} from 'react';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import {
  Ap, Atitle
} from '../../atoms';
import {
  Button, NodeTree
} from '../../molecules';
import { RichTextElement } from '../richTextElement';

import type {
  ICuratedCyberFrame, ICuratedNode, ICyberFrameBranch
} from '../../types';

import {
  classTrim, getCyberFrameLevelsByNodes
} from '../../utils';

import './characterCreation.scss';

interface ICharacterCreationStep1 {
  /** When the user click send and the data is send perfectly */
  onSubmitCyberFrame: (id: string) => void
}

const CharacterCreationStep1: FC<ICharacterCreationStep1> = ({ onSubmitCyberFrame }) => {
  const { t } = useTranslation();
  const {
    cyberFrames, character
  } = useGlobalVars();

  const [openedCFrame, setOpenedCFrame] = useState<ICuratedCyberFrame | null>(null);
  const [detailsOpened, setDetailsOpened] = useState<boolean>(false);

  const onOpenDetails = useCallback(
    (id: string) => {
      const foundCFrame = cyberFrames.find(({ cyberFrame }) => cyberFrame._id === id);
      if (foundCFrame !== undefined) {
        setOpenedCFrame(foundCFrame);
      }
    },
    [cyberFrames]
  );

  const chosenCyberFrame = useMemo<ICuratedCyberFrame | null>(() => {
    if (character === null || character === false) {
      return null;
    }

    return getCyberFrameLevelsByNodes(character.nodes, cyberFrames)[0]?.cyberFrame;
  }, [character, cyberFrames]);

  const detailsBlock = useMemo(() => {
    if (openedCFrame === null) {
      return <div className="characterCreation-step1__detail-block" />;
    }
    const { cyberFrame } = openedCFrame;
    const tempTree: Record<
      string,
      {
        branch: ICyberFrameBranch
        nodes: ICuratedNode[]
      }
    > = {};
    cyberFrame.branches.forEach(({ cyberFrameBranch }) => {
      tempTree[cyberFrameBranch._id] = {
        branch: cyberFrameBranch,
        nodes: cyberFrameBranch.nodes
      };
    });

    return (
      <div className="characterCreation-step1__detail-block">
        <NodeTree
          className="characterCreation-step1__detail-block__tree"
          tree={Object.values(tempTree)}
        />
        <div className="characterCreation-step1__detail-block__vertical">
          <div className="characterCreation-step1__detail-block__main">
            <Atitle level={2} className="characterCreation-step1__detail-block__title">
              {cyberFrame.title}
            </Atitle>
            <RichTextElement
              className="characterCreation-step1__detail-block__text"
              rawStringContent={cyberFrame.summary}
              readOnly
            />
          </div>
          <div className="characterCreation-step1__detail-block__btns">
            {chosenCyberFrame?.cyberFrame._id === cyberFrame._id
              ? null
              : (
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
                )}
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
      </div>
    );
  }, [
    openedCFrame,
    t,
    chosenCyberFrame?.cyberFrame._id,
    onSubmitCyberFrame
  ]);

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
          <div className="characterCreation-step1__cFrame__title">
            <Atitle level={2} className="characterCreation-step1__cFrame__title__content">
              {cyberFrame.title}
            </Atitle>
            {chosenCyberFrame?.cyberFrame._id === cyberFrame._id
              ? (
                  <Ap className="characterCreation-step1__cFrame__title__text">
                    {t('characterCreation.step1.chosen', { ns: 'components' })}
                  </Ap>
                )
              : null}
          </div>

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
  }, [
    cyberFrames,
    openedCFrame?.cyberFrame._id,
    detailsOpened,
    chosenCyberFrame?.cyberFrame._id,
    t,
    onOpenDetails
  ]);

  return (
    <motion.div
      className={classTrim(`
        characterCreation-step1
        ${detailsOpened ? 'characterCreation-step1--details' : ''}
      `)}
      initial={{ transform: 'skew(90deg, 0deg) scale3d(.2, .2, .2)' }}
      animate={{
        transform: 'skew(0, 0) scale3d(1, 1, 1)',
        transitionEnd: { transform: 'none' }
      }}
      exit={{ transform: 'skew(-90deg, 0deg) scale3d(.2, .2, .2)' }}
      transition={{
        ease: 'easeInOut', duration: 0.2
      }}
    >
      <div className="characterCreation-step1__details">{detailsBlock}</div>
      <Ap className="characterCreation-step1__text">
        {t('characterCreation.step1.text', { ns: 'components' })}
      </Ap>
      <Ap className="characterCreation-step1__sub">
        {t('characterCreation.step1.sub', { ns: 'components' })}
      </Ap>
      <div className="characterCreation-step1__list">{cyberFrameList}</div>
    </motion.div>
  );
};

export default CharacterCreationStep1;
