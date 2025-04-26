import React, { useCallback, useMemo, useState, type FC, type ReactNode } from 'react';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ap, Atitle } from '../../atoms';
import { Button, HintText } from '../../molecules';
import { curateCharacterBody, curateCyberFrame, getActualBody } from '../../utils/character';
import { RichTextElement } from '../richTextElement';

import type {
  ICompleteCyberFrame,
  ICuratedCyberFrame,
  ICuratedCyberFrameCharParam,
  ICuratedCyberFrameStat,
} from '../../types';

import { classTrim } from '../../utils';

import './characterCreation.scss';

const charParamOrder = ['hp', 'ram', 'pyr', 'arr', 'ini', 'msp'];
const statOrder = ['pow', 'dex', 'cmp', 'fee', 'pre'];

interface ICharacterCreationStep1 {
  /** When the user click send and the data is send perfectly */
  onSubmitCyberFrame: (id: string, hp: number) => void;
}

const CharacterCreationStep1: FC<ICharacterCreationStep1> = ({ onSubmitCyberFrame }) => {
  const { t } = useTranslation();
  const { cyberFrames, character, charParams, stats } = useGlobalVars();

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

  const chosenCyberFrame = useMemo<ICompleteCyberFrame | null>(() => {
    if (character === null || character === false) {
      return null;
    }
    const { body } = getActualBody(character);

    if (body === undefined) {
      return null;
    }
    const curatedBody = curateCharacterBody({ body, cyberFrames, charParams, stats });

    return curatedBody.cyberFrame;
  }, [charParams, character, cyberFrames, stats]);

  const detailsBlock = useMemo(() => {
    if (openedCFrame === null) {
      return <div className="characterCreation-step1__detail-block" />;
    }
    const { cyberFrame } = curateCyberFrame({ cyberFrame: openedCFrame, charParams, stats });
    const orderedCharParam: ICuratedCyberFrameCharParam[] = [];
    charParamOrder.forEach((charParamElt) => {
      const elt = cyberFrame.charParams.find(
        ({ charParam }) => charParam.charParam.formulaId === charParamElt
      );
      if (elt !== undefined) {
        orderedCharParam.push(elt);
      }
    });

    const orderedStat: ICuratedCyberFrameStat[] = [];
    statOrder.forEach((statElt) => {
      const elt = cyberFrame.stats.find(({ stat }) => stat.stat.formulaId === statElt);
      if (elt !== undefined) {
        orderedStat.push(elt);
      }
    });

    const cyberframeHp = cyberFrame.charParams.find(
      ({ charParam }) => charParam.charParam.formulaId === 'hp'
    );

    return (
      <div className="characterCreation-step1__detail-block">
        <div className="characterCreation-step1__detail-block__vertical">
          <div className="characterCreation-step1__detail-block__main">
            <Atitle level={2} className="characterCreation-step1__detail-block__main__title">
              {cyberFrame.title}
            </Atitle>
            <RichTextElement
              className="characterCreation-step1__detail-block__main__text"
              rawStringContent={cyberFrame.summary}
              readOnly
            />
          </div>
          <div className="characterCreation-step1__detail-block__side">
            <div className="characterCreation-step1__detail-block__side__charParams">
              {orderedCharParam.map((charParam) => (
                <HintText
                  key={charParam._id}
                  className="characterCreation-step1__cFrame__charParam"
                  noDecor
                  hint={
                    <RichTextElement
                      className="characterCreation-step1__cFrame__text"
                      rawStringContent={charParam.charParam.charParam.summary}
                      readOnly
                    />
                  }
                >
                  <Ap className="characterCreation-step1__detail-block__side__charParam__title">
                    {charParam.charParam.charParam.short}
                  </Ap>
                  <Ap className="characterCreation-step1__detail-block__side__charParam__value">
                    {charParam.value}
                  </Ap>
                </HintText>
              ))}
            </div>
            <div className="characterCreation-step1__detail-block__side__stats">
              {orderedStat.map((stat) => (
                <Ap
                  key={stat._id}
                  className="characterCreation-step1__detail-block__side__stats__elt"
                >
                  {t('characterCreation.step1.cFrameSkillPoints', {
                    ns: 'components',
                    count: stat.value,
                    carac: stat.stat.stat.title,
                  })}
                </Ap>
              ))}
            </div>
            <div className="characterCreation-step1__detail-block__side__btns">
              {chosenCyberFrame?.cyberFrame._id === cyberFrame._id ? null : (
                <Button
                  theme="afterglow"
                  size="large"
                  onClick={() => {
                    onSubmitCyberFrame(cyberFrame._id, cyberframeHp?.value ?? 0);
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
      </div>
    );
  }, [openedCFrame, charParams, stats, chosenCyberFrame?.cyberFrame._id, t, onSubmitCyberFrame]);

  const cyberFrameList = useMemo(() => {
    const cFrameElts: ReactNode[] = [];
    cyberFrames.forEach((cyberFrameElt) => {
      const { cyberFrame } = curateCyberFrame({ cyberFrame: cyberFrameElt, charParams, stats });
      const orderedCharParam: ICuratedCyberFrameCharParam[] = [];
      charParamOrder.forEach((charParamElt) => {
        const elt = cyberFrame.charParams.find(
          ({ charParam }) => charParam.charParam.formulaId === charParamElt
        );
        if (elt !== undefined) {
          orderedCharParam.push(elt);
        }
      });

      const orderedStat: ICuratedCyberFrameStat[] = [];
      statOrder.forEach((statElt) => {
        const elt = cyberFrame.stats.find(({ stat }) => stat.stat.formulaId === statElt);
        if (elt !== undefined) {
          orderedStat.push(elt);
        }
      });

      cFrameElts.push(
        <Button
          size="xsmall"
          theme="afterglow"
          key={cyberFrame._id}
          className={classTrim(`
            characterCreation-step1__cFrame
            ${openedCFrame?.cyberFrame._id === cyberFrame._id && detailsOpened ? 'characterCreation-step1__cFrame--opened' : ''}
          `)}
          onClick={() => {
            onOpenDetails(cyberFrame._id);
            setDetailsOpened(true);
          }}
        >
          <div className="characterCreation-step1__cFrame__content">
            <div className="characterCreation-step1__cFrame__title">
              <Atitle level={2} className="characterCreation-step1__cFrame__title__content">
                {cyberFrame.title}
              </Atitle>
              {chosenCyberFrame?.cyberFrame._id === cyberFrame._id ? (
                <Ap className="characterCreation-step1__cFrame__title__text">
                  {t('characterCreation.step1.chosen', { ns: 'components' })}
                </Ap>
              ) : null}
            </div>

            <div className="characterCreation-step1__cFrame__charParams">
              {orderedCharParam.map((charParam) => (
                <HintText
                  key={charParam._id}
                  className="characterCreation-step1__cFrame__charParam"
                  noDecor
                  hint={
                    <RichTextElement
                      className="characterCreation-step1__cFrame__text"
                      rawStringContent={charParam.charParam.charParam.summary}
                      readOnly
                    />
                  }
                >
                  <Ap className="characterCreation-step1__cFrame__charParam__title">
                    {charParam.charParam.charParam.short}
                  </Ap>
                  <Ap className="characterCreation-step1__cFrame__charParam__value">
                    {charParam.value}
                  </Ap>
                </HintText>
              ))}
            </div>

            <div className="characterCreation-step1__cFrame__stats">
              {orderedStat.map((stat) => (
                <Ap key={stat._id} className="characterCreation-step1__cFrame__stats__elt">
                  {t('characterCreation.step1.cFrameSkillPoints', {
                    ns: 'components',
                    count: stat.value,
                    carac: stat.stat.stat.title,
                  })}
                </Ap>
              ))}
            </div>
          </div>
        </Button>
      );
    });

    return cFrameElts;
  }, [
    cyberFrames,
    charParams,
    stats,
    openedCFrame?.cyberFrame._id,
    detailsOpened,
    chosenCyberFrame?.cyberFrame._id,
    t,
    onOpenDetails,
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
        transitionEnd: { transform: 'none' },
      }}
      exit={{ transform: 'skew(-90deg, 0deg) scale3d(.2, .2, .2)' }}
      transition={{
        ease: 'easeInOut',
        duration: 0.2,
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
