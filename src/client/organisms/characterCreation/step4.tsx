import React, { type ReactNode, useMemo, useState, type FC, useCallback } from 'react';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ali, Ap, Atitle, Aul } from '../../atoms';
import ANodeIcon from '../../atoms/anodeIcon';
import { Button } from '../../molecules';
import { RichTextElement } from '../richTextElement';

import type { ICuratedClergy } from '../../types';
import type { TypeNodeIcons } from '../../types/rules';

import { classTrim, getValuesFromGlobalValues } from '../../utils';

import './characterCreation.scss';

interface ICharacterCreationStep4 {
  /** When the user click send */
  onSubmitVows: (id: string[]) => void;
}

const CharacterCreationStep4: FC<ICharacterCreationStep4> = ({
  // backgrounds,
  onSubmitVows,
}) => {
  const { t } = useTranslation();
  const { clergies, character, globalValues } = useGlobalVars();

  const [openedClergy, setOpenedClergy] = useState<ICuratedClergy | null>(null);
  const [detailsOpened, setDetailsOpened] = useState<boolean>(false);

  const [tennetsChosen, setTennetChosen] = useState<string[]>([]);

  const { tennetsToBeChosen } = useMemo(
    () => getValuesFromGlobalValues(['tennetsToBeChosen'], globalValues),
    [globalValues]
  );

  const onOpenDetails = useCallback(
    (id: string) => {
      const foundClergy = clergies.find(({ clergy }) => clergy._id === id);
      if (foundClergy !== undefined) {
        setOpenedClergy(foundClergy);
      }
    },
    [clergies]
  );

  const chosenClergy = useMemo<ICuratedClergy | null>(() => {
    if (character === null || character === false || character.vows?.[0] === undefined) {
      return null;
    }

    const foundClergy = clergies.find(
      (clergy) => clergy.clergy._id === character.vows?.[0].vow.clergy
    );
    if (foundClergy === undefined) {
      return null;
    }

    return foundClergy;
  }, [character, clergies]);

  const detailsBlock = useMemo(() => {
    if (openedClergy === null) {
      return <div className="characterCreation-step4__detail-block" />;
    }

    return (
      <div className="characterCreation-step4__detail-block">
        <div className="characterCreation-step4__detail-block__vertical">
          <div className="characterCreation-step4__detail-block__main">
            <ANodeIcon
              className="characterCreation-step4__detail-block__main__icon"
              type={openedClergy.clergy.icon as TypeNodeIcons}
            />
            <Atitle level={2} className="characterCreation-step4__detail-block__main__title">
              {openedClergy.clergy.title}
            </Atitle>
            <RichTextElement
              className="characterCreation-step4__detail-block__main__text"
              rawStringContent={openedClergy.clergy.summary}
              readOnly
            />
          </div>
          <div className="characterCreation-step4__detail-block__side">
            <div className="characterCreation-step4__detail-block__side__tennets">
              <Ap className="characterCreation-step4__detail-block__side__tennets__text">
                {t('characterCreation.step4.selectTenets', {
                  ns: 'components',
                  count: tennetsToBeChosen,
                })}
              </Ap>
              <Aul className="characterCreation-step4__detail-block__side__tennets__list" noPoints>
                {openedClergy.clergy.vows.map((vow) => {
                  const isTennetChosen = tennetsChosen.find(
                    (singleTennetChosen) => singleTennetChosen === vow.vow._id
                  );

                  return (
                    <Ali key={vow.vow._id}>
                      <Button
                        theme="text-only"
                        color={isTennetChosen !== undefined ? 'tertiary' : 'primary'}
                        disabled={
                          isTennetChosen === undefined &&
                          tennetsChosen.length >= (tennetsToBeChosen ?? 0)
                        }
                        onClick={() => {
                          setTennetChosen((prev) => {
                            const next = [...prev];
                            const foundIndex = next.findIndex((nextElt) => nextElt === vow.vow._id);
                            if (foundIndex !== -1) {
                              next.splice(foundIndex, 1);
                            } else {
                              next.push(vow.vow._id);
                            }

                            return next;
                          });
                        }}
                      >
                        {vow.vow.title}
                      </Button>
                    </Ali>
                  );
                })}
              </Aul>
            </div>
            <div className="characterCreation-step4__detail-block__side__btns">
              <div className="characterCreation-step4__detail-block__side__btns__main">
                <Button
                  theme="text-only"
                  size="large"
                  onClick={() => {
                    setTennetChosen(() => {
                      const tempVowList = [...openedClergy.clergy.vows];
                      const next: string[] = [];

                      for (let i = 0; i < (tennetsToBeChosen ?? 0); i++) {
                        const randomTennetIndex = Math.round(
                          Math.random() * (tempVowList.length - 1)
                        );
                        const selectedVow = tempVowList.splice(randomTennetIndex, 1);
                        next.push(selectedVow[0].vow._id);
                      }

                      return next;
                    });
                  }}
                >
                  {t('characterCreation.step4.randomizeCta', { ns: 'components' })}
                </Button>
                <Button
                  theme="afterglow"
                  size="large"
                  disabled={tennetsChosen.length !== tennetsToBeChosen}
                  onClick={() => {
                    onSubmitVows(tennetsChosen);
                    setDetailsOpened(false);
                  }}
                >
                  {t('characterCreation.step4.chooseCta', { ns: 'components' })}
                </Button>
              </div>

              <Button
                theme="text-only"
                size="large"
                onClick={() => {
                  setDetailsOpened(false);
                  setTennetChosen([]);
                }}
              >
                {t('characterCreation.step4.return', { ns: 'components' })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [openedClergy, t, tennetsToBeChosen, tennetsChosen, onSubmitVows]);

  const clergyList = useMemo(() => {
    const cFrameElts: ReactNode[] = [];
    clergies.forEach(({ clergy }) => {
      cFrameElts.push(
        <Button
          size="xsmall"
          theme="afterglow"
          key={clergy._id}
          className={classTrim(`
            characterCreation-step1__clergy
            ${openedClergy?.clergy._id === clergy._id && detailsOpened ? 'characterCreation-step1__clergy--opened' : ''}
          `)}
          onClick={() => {
            onOpenDetails(clergy._id);
            setDetailsOpened(true);
          }}
        >
          <div className="characterCreation-step1__clergy__content">
            <div className="characterCreation-step1__clergy__title">
              <ANodeIcon
                className="characterCreation-step1__clergy__title__icon"
                type={clergy.icon as TypeNodeIcons}
                size="large"
              />
              <Atitle level={2} className="characterCreation-step1__clergy__title__content">
                {clergy.title}
              </Atitle>
              {chosenClergy?.clergy._id === clergy._id ? (
                <Ap className="characterCreation-step1__clergy__title__text">
                  {t('characterCreation.step4.chosen', { ns: 'components' })}
                </Ap>
              ) : null}
            </div>
          </div>
        </Button>
      );
    });

    return cFrameElts;
  }, [
    clergies,
    openedClergy?.clergy._id,
    detailsOpened,
    chosenClergy?.clergy._id,
    t,
    onOpenDetails,
  ]);

  return (
    <motion.div
      className={classTrim(`
        characterCreation-step4
        ${detailsOpened ? 'characterCreation-step4--details' : ''}
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
      <div className="characterCreation-step4__details">{detailsBlock}</div>
      <Ap className="characterCreation-step4__text">
        {t('characterCreation.step4.text', { ns: 'components' })}
      </Ap>
      <Ap className="characterCreation-step4__sub">
        {t('characterCreation.step4.sub', { ns: 'components' })}
      </Ap>
      <div className="characterCreation-step4__list">{clergyList}</div>
    </motion.div>
  );
};

export default CharacterCreationStep4;
