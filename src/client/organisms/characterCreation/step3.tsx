import React, { useCallback, useEffect, useMemo, useState, type FC, type ReactNode } from 'react';

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useGlobalVars } from '../../providers';

import { Ali, Ap, Atitle, Aul, type typeIcons } from '../../atoms';
import { Button, Helper, NodeTree } from '../../molecules';
import {
  aggregateSkillsByStats,
  calculateStatMod,
  getActualBody,
  getBaseSkillNode,
  getCyberFrameLevelsByNodes,
} from '../../utils/character';
import { RichTextElement } from '../richTextElement';

import type { ICuratedNode, ICuratedSkill, ISkillBranch } from '../../types';

import { classTrim, getValuesFromGlobalValues } from '../../utils';

import './characterCreation.scss';

interface ICharacterCreationStep2 {
  /** When the user click send and the data is send perfectly */
  onSubmitSkills: (nodes: string[]) => void;
}

const CharacterCreationStep2: FC<ICharacterCreationStep2> = ({ onSubmitSkills }) => {
  const { t } = useTranslation();
  const { skills, stats, globalValues, character, cyberFrames } = useGlobalVars();

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [openedSkill, setOpenedSkill] = useState<ICuratedSkill | null>(null);
  const [detailsOpened, setDetailsOpened] = useState<boolean>(false);

  const handleSubmitSkills = useCallback(() => {
    const nodeIdToSend: string[] = [];
    selectedSkills.forEach((skillId) => {
      const linkedSkill = skills.find(({ skill }) => skill._id === skillId);
      if (linkedSkill !== undefined) {
        const baseSkillNode = getBaseSkillNode(linkedSkill.skill);
        if (baseSkillNode !== undefined) {
          nodeIdToSend.push(baseSkillNode.node._id);
        }
      }
    });
    if (nodeIdToSend.length !== selectedSkills.length) {
      console.error('The nodes sent and the selected skills dont match at step 3');
    } else {
      onSubmitSkills(nodeIdToSend);
    }
  }, [skills, selectedSkills, onSubmitSkills]);

  const aggregatedSkills = useMemo(() => aggregateSkillsByStats(skills, stats), [skills, stats]);

  const { nbBeginningSkills } = useMemo(
    () => getValuesFromGlobalValues(['nbBeginningSkills'], globalValues),
    [globalValues]
  );

  // Only send CyberFrame bonuses for the moment
  // TODO : When level up / death, reuse this function more globally
  const bonusesByStat = useMemo(() => {
    if (character === null || character === false) {
      return [];
    }

    const nodesByCyberFrames = getCyberFrameLevelsByNodes(character.nodes, cyberFrames);

    const statBonuses: Record<
      string,
      {
        bonus: number;
        source: string;
        sourceId: string;
        broad: boolean;
      }
    > = {};

    // If only one source for the list, we'll be precise
    // If multiple sources for bonuses, we are borad in the phrasing
    nodesByCyberFrames.forEach(({ cyberFrame, chosenNodes }) => {
      chosenNodes.forEach((node) => {
        if (node.statBonuses !== undefined && node.statBonuses.length > 0) {
          node.statBonuses.forEach((statBonus) => {
            if (statBonuses[statBonus.stat] === undefined) {
              statBonuses[statBonus.stat] = {
                bonus: statBonus.value,
                source: cyberFrame.cyberFrame.title,
                sourceId: cyberFrame.cyberFrame._id,
                broad: false,
              };
            } else {
              statBonuses[statBonus.stat].bonus += statBonus.value;
              if (statBonuses[statBonus.stat].sourceId !== cyberFrame.cyberFrame._id) {
                statBonuses[statBonus.stat].broad = true;
              }
            }
          });
        }
      });
    });

    return statBonuses;
  }, [character, cyberFrames]);

  const detailsBlock = useMemo(() => {
    if (openedSkill === null) {
      return <div className="characterCreation-step3__detail-block" />;
    }
    const { skill } = openedSkill;
    const tempTree: Record<
      string,
      {
        branch: ISkillBranch;
        nodes: ICuratedNode[];
      }
    > = {};
    skill.branches.forEach(({ skillBranch }) => {
      tempTree[skillBranch._id] = {
        branch: skillBranch,
        nodes: skillBranch.nodes,
      };
    });
    return (
      <div className="characterCreation-step3__detail-block">
        <NodeTree
          className="characterCreation-step3__detail-block__tree"
          tree={Object.values(tempTree)}
        />
        <div className="characterCreation-step3__detail-block__vertical">
          <div className="characterCreation-step3__detail-block__main">
            <Atitle level={2} className="characterCreation-step3__detail-block__title">
              {skill.title}
            </Atitle>
            <RichTextElement
              className="characterCreation-step3__detail-block__text"
              rawStringContent={skill.summary}
              readOnly
            />
          </div>
          <div className="characterCreation-step3__detail-block__btns">
            {openedSkill.skill._id === skill._id ? null : (
              <Button
                theme="afterglow"
                size="large"
                onClick={() => {
                  setDetailsOpened(false);
                }}
              >
                {t('characterCreation.step3.chooseCta', { ns: 'components' })}
              </Button>
            )}
            <Button
              theme="text-only"
              size="large"
              onClick={() => {
                setDetailsOpened(false);
              }}
            >
              {t('characterCreation.step3.return', { ns: 'components' })}
            </Button>
          </div>
        </div>
      </div>
    );
  }, [openedSkill, t]);

  const statBlocks = useMemo(() => {
    if (character === null || character === false) {
      return [];
    }
    const relevantBody = getActualBody(character);
    if (relevantBody.body === undefined || relevantBody.duplicate) {
      return [];
    }
    const statElts: ReactNode[] = [];
    const nbSkillSelected = nbBeginningSkills - selectedSkills.length;
    aggregatedSkills.forEach(({ stat, skills }) => {
      if (relevantBody.body !== undefined) {
        const relevantCharacterData = relevantBody.body.stats.find(
          ({ stat: bodyStat }) => bodyStat === stat.stat._id
        );

        const valMod = calculateStatMod(
          Number(relevantCharacterData?.value + (bonusesByStat[stat.stat._id]?.bonus ?? 0))
        );
        statElts.push(
          <div key={stat.stat._id} className="characterCreation-step3__stat-block">
            <div className="characterCreation-step3__stat-block__title">
              <Atitle className="characterCreation-step3__stats__content__title" level={3}>
                {stat.stat.title}
              </Atitle>
              <Ap className="characterCreation-step3__stat-block__mod">
                {`${t('terms.general.modifierShort')}: `}
                <span
                  className={classTrim(`
                      characterCreation-step3__stat-block__mod__value
                      ${valMod < 0 ? 'characterCreation-step3__stat-block__mod__value--negative' : ''}
                      ${valMod > 0 ? 'characterCreation-step3__stat-block__mod__value--positive' : ''}
                    `)}
                >
                  {valMod}
                </span>
              </Ap>
            </div>
            <Aul noPoints className="characterCreation-step3__stat-block__content">
              {skills.map((skill) => {
                const selected =
                  selectedSkills.find((skillId) => skillId === skill.skill._id) !== undefined;
                const baseNode = getBaseSkillNode(skill.skill);
                let bonus = 0;
                if (baseNode !== undefined) {
                  baseNode.node.skillBonuses?.forEach((skillBonus) => {
                    if (skillBonus.skill === skill.skill._id) {
                      bonus += skillBonus.value;
                    }
                  });
                }
                const skillVal = valMod + (selected ? bonus : 0);
                let icon: typeIcons = 'Add';
                if (selected) {
                  if (nbSkillSelected === 0) {
                    icon = 'Check';
                  } else {
                    icon = 'Minus';
                  }
                } else if (nbSkillSelected === 0) {
                  icon = 'Cross';
                }
                return (
                  <Ali
                    key={skill.skill._id}
                    className={classTrim(`
                      characterCreation-step3__stat-block__content__elt
                      ${selected ? 'characterCreation-step3__stat-block__content__elt--selected' : ''}
                    `)}
                  >
                    <span className="characterCreation-step3__stat-block__content__name">
                      <Button
                        icon={icon}
                        theme={selected || nbSkillSelected === 0 ? 'text-only' : 'solid'}
                        size="small"
                        disabled={nbSkillSelected === 0 && !selected}
                        onClick={() => {
                          setSelectedSkills((prev) => {
                            const next = [...prev];
                            const valIndex = next.findIndex((val) => val === skill.skill._id);
                            if (valIndex !== -1) {
                              next.splice(valIndex, 1);
                            } else {
                              next.push(skill.skill._id);
                            }
                            return next;
                          });
                        }}
                      />
                      {skill.skill.title}
                      <Helper
                        size="small"
                        theme="text-only"
                        onClick={() => {
                          setOpenedSkill(skill);
                          setDetailsOpened(true);
                        }}
                      >
                        <RichTextElement rawStringContent={skill.skill.summary} readOnly />
                      </Helper>
                    </span>
                    <span
                      className={classTrim(`
                        characterCreation-step3__stat-block__content__value
                        ${skillVal < 0 ? 'characterCreation-step3__stat-block__content__value--negative' : ''}
                        ${skillVal > 0 ? 'characterCreation-step3__stat-block__content__value--positive' : ''}
                      `)}
                    >
                      {skillVal}
                    </span>
                  </Ali>
                );
              })}
            </Aul>
          </div>
        );
        if (statElts.length === 1) {
          statElts.push(
            <div key="block-stat-points" className="characterCreation-step3__points">
              <Ap className="characterCreation-step3__points__text">
                {t('characterCreation.step3.pointsLeft', { ns: 'components' })}
              </Ap>
              <Ap className="characterCreation-step3__points__value">{nbSkillSelected}</Ap>
              <Button
                type="submit"
                className="characterCreation-step3__points__btn"
                disabled={nbSkillSelected !== 0}
                theme={nbSkillSelected !== 0 ? 'text-only' : 'afterglow'}
                onClick={handleSubmitSkills}
              >
                {t('characterCreation.step3.next', { ns: 'components' })}
              </Button>
            </div>
          );
        }
      }
    });
    return statElts;
  }, [
    character,
    nbBeginningSkills,
    selectedSkills,
    aggregatedSkills,
    bonusesByStat,
    t,
    handleSubmitSkills,
  ]);

  useEffect(() => {
    if (
      character !== null &&
      character !== false &&
      character.nodes !== undefined &&
      character.nodes.length > 1
    ) {
      const nodeBranchIds = character.nodes
        .filter(({ node }) => node.skillBranch !== undefined)
        .map(({ node }) => node.skillBranch);
      const skillIds: string[] = [];
      nodeBranchIds.forEach((nodeBranchId) => {
        const foundSkill = skills.find(
          ({ skill }) =>
            skill.branches.find(({ skillBranch }) => skillBranch._id === nodeBranchId) !== undefined
        );
        if (foundSkill !== undefined) {
          skillIds.push(foundSkill.skill._id);
        }
      });
      setSelectedSkills(skillIds ?? []);
    }
  }, [character, skills]);

  return (
    <motion.div
      className={classTrim(`
        characterCreation-step3
        ${detailsOpened ? 'characterCreation-step3--details' : ''}
      `)}
      initial={{
        transform: 'skew(80deg, 0deg) scale3d(.2, .2, .2)',
      }}
      animate={{
        transform: 'skew(0, 0) scale3d(1, 1, 1)',
        transitionEnd: {
          transform: 'none',
        },
      }}
      exit={{
        transform: 'skew(-80deg, 0deg) scale3d(.2, .2, .2)',
      }}
      transition={{ ease: 'easeInOut', duration: 0.2 }}
    >
      <div className="characterCreation-step3__details">{detailsBlock}</div>
      <Ap className="characterCreation-step3__text">
        {t('characterCreation.step3.text', { ns: 'components' })}
      </Ap>
      <Ap className="characterCreation-step3__sub">
        {t('characterCreation.step3.sub', { ns: 'components' })}
      </Ap>
      <div className="characterCreation-step3__list">{statBlocks}</div>
    </motion.div>
  );
};

export default CharacterCreationStep2;
