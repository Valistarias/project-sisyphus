import {
  type IBody,
  type ICharacter,
  type ICharacterNode,
  type ICuratedCyberFrame,
  type ICuratedNode,
  type ICuratedSkill,
  type ICuratedStat,
  type INode,
  type ISkill,
} from '../types';

import { addSymbol } from '.';

export interface ICyberFrameLevels {
  cyberFrame: ICuratedCyberFrame;
  level: number;
  chosenNodes: INode[];
}

const getCyberFrameLevelsByNodes = (
  nodes: ICharacterNode[] | undefined,
  cyberFrames: ICuratedCyberFrame[]
): ICyberFrameLevels[] => {
  if (nodes === undefined) {
    return [];
  }
  const tempFrames: Record<string, ICyberFrameLevels> = {};
  nodes.forEach(({ node }) => {
    if (node.cyberFrameBranch !== undefined) {
      const foundCyberFrame = cyberFrames.find(
        ({ cyberFrame }) =>
          cyberFrame.branches.find(
            ({ cyberFrameBranch }) => cyberFrameBranch._id === node.cyberFrameBranch
          ) !== undefined
      );
      if (foundCyberFrame !== undefined) {
        if (tempFrames[foundCyberFrame.cyberFrame._id] === undefined) {
          tempFrames[foundCyberFrame.cyberFrame._id] = {
            cyberFrame: foundCyberFrame,
            level: 0,
            chosenNodes: [],
          };
        }
        tempFrames[foundCyberFrame.cyberFrame._id].level += 1;
        tempFrames[foundCyberFrame.cyberFrame._id].chosenNodes.push(node);
      }
    }
  });

  return Object.values(tempFrames);
};

interface IHpValues {
  hp: number;
  total: number;
  isLoading: boolean;
}

const getCharacterHpValues = (
  character: ICharacter | null | false,
  baseHp: number,
  hpParamId: string | undefined
): IHpValues => {
  if (character === null || character === false || hpParamId === undefined) {
    return {
      hp: 0,
      total: 0,
      isLoading: true,
    };
  }

  const { body } = getActualBody(character);

  let hpValue = 0;
  let isLoading = true;
  let totalHpValue = baseHp;

  if (body !== undefined) {
    hpValue = body.hp;
    isLoading = false;
  }

  character.nodes?.forEach(({ node }) => {
    node.charParamBonuses?.forEach((charParamBonus) => {
      if (charParamBonus.charParam === hpParamId) {
        totalHpValue += charParamBonus.value;
      }
    });
  });

  return {
    hp: hpValue,
    total: totalHpValue,
    isLoading,
  };
};

const aggregateSkillsByStats = (
  skills: ICuratedSkill[],
  stats: ICuratedStat[]
): Array<{
  stat: ICuratedStat;
  skills: ICuratedSkill[];
}> => {
  if (skills.length === 0) {
    return [];
  }
  const tempAggregatedStats = {};
  skills.forEach(({ skill, i18n }) => {
    const relatedStat = stats.find(({ stat }) => stat._id === skill.stat._id);
    if (relatedStat !== undefined) {
      if (tempAggregatedStats[skill.stat._id] === undefined) {
        tempAggregatedStats[skill.stat._id] = {
          stat: relatedStat,
          skills: [],
        };
      }
      tempAggregatedStats[skill.stat._id].skills.push({ skill, i18n });
    }
  });

  return Object.values(tempAggregatedStats);
};

const getActualBody = (
  character: ICharacter
): {
  body: IBody | undefined;
  duplicate: boolean;
} => {
  const relevantBodies = character?.bodies?.filter((body) => body.alive);
  return {
    body: relevantBodies?.[0] ?? undefined,
    duplicate: relevantBodies !== undefined && relevantBodies.length > 1,
  };
};

export interface ISourcePointsStatSkill {
  value: number;
  origin?: INode & {
    cyberFrame?: ICuratedCyberFrame;
    skill?: ICuratedSkill;
  };
  fromBody?: boolean;
  fromStat?: boolean;
  fromThrottleStat?: boolean;
}

export interface IScoreStatSkill {
  total: number;
  sources: ISourcePointsStatSkill[];
}

const curateCharacterSkills = (
  character: false | ICharacter | null,
  skills: ICuratedSkill[],
  stats: ICuratedStat[],
  cyberFrames: ICuratedCyberFrame[]
): Array<{
  stat: ICuratedStat & {
    score: IScoreStatSkill;
  };
  skills: Array<
    ICuratedStat & {
      score: IScoreStatSkill;
    }
  >;
}> => {
  if (character === false || character === null) {
    return [];
  }
  const { body } = getActualBody(character);
  if (body === undefined) {
    return [];
  }

  const skillNodesById: Record<string, IScoreStatSkill> = {};
  const statNodesById: Record<string, IScoreStatSkill> = {};

  body.stats.forEach(({ stat, value }) => {
    statNodesById[stat] = {
      total: value,
      sources: [
        {
          value,
          fromBody: true,
        },
      ],
    };
  });

  character.nodes?.forEach(({ node }) => {
    let foundCyberFrame: ICuratedCyberFrame | undefined;
    let foundSkill: ICuratedSkill | undefined;
    if (node.cyberFrameBranch !== undefined) {
      foundCyberFrame = cyberFrames.find(
        ({ cyberFrame }) =>
          cyberFrame.branches.find(
            ({ cyberFrameBranch }) => cyberFrameBranch._id === node.cyberFrameBranch
          ) !== undefined
      );
    }
    if (node.skillBranch !== undefined) {
      foundSkill = skills.find(
        ({ skill }) =>
          skill.branches.find(({ skillBranch }) => skillBranch._id === node.skillBranch) !==
          undefined
      );
    }
    node.skillBonuses?.forEach((skillBonus) => {
      if (skillNodesById[skillBonus.skill] === undefined) {
        skillNodesById[skillBonus.skill] = {
          total: skillBonus.value,
          sources: [
            {
              value: skillBonus.value,
              origin: {
                ...node,
                cyberFrame: foundCyberFrame,
                skill: foundSkill,
              },
            },
          ],
        };
      } else {
        skillNodesById[skillBonus.skill].total += skillBonus.value;
        skillNodesById[skillBonus.skill].sources.push({
          value: skillBonus.value,
          origin: {
            ...node,
            cyberFrame: foundCyberFrame,
            skill: foundSkill,
          },
        });
      }
    });
    node.statBonuses?.forEach((statBonus) => {
      statNodesById[statBonus.stat].total += statBonus.value;
      statNodesById[statBonus.stat].sources.push({
        value: statBonus.value,
        origin: {
          ...node,
          cyberFrame: foundCyberFrame,
          skill: foundSkill,
        },
      });
    });
  });
  const charStats = {};
  skills.forEach(({ skill, i18n }) => {
    const relatedStat = stats.find(({ stat }) => stat._id === skill.stat._id);
    const relatedStatBonuses = statNodesById[skill.stat._id];
    const relatedSkillBonuses = skillNodesById[skill._id];
    if (relatedStat !== undefined) {
      if (charStats[skill.stat._id] === undefined) {
        charStats[skill.stat._id] = {
          stat: {
            ...relatedStat,
            score: relatedStatBonuses,
          },
          skills: [],
        };
      }
      const score = {
        total: relatedStatBonuses.total + (relatedSkillBonuses?.total ?? 0),
        sources: [
          {
            value: relatedStatBonuses.total,
            fromStat: true,
          },
          ...(relatedSkillBonuses?.sources ?? []),
        ],
      };
      charStats[skill.stat._id].skills.push({
        skill,
        i18n,
        score,
      });
    }
  });
  return Object.values(charStats);
};

const getBaseSkillNode = (skill: ISkill): ICuratedNode | undefined => {
  const generalNodes = skill.branches.find((branch) => branch.skillBranch.title === '_general')
    ?.skillBranch.nodes;
  return generalNodes?.find(({ node }) => node.rank === 1);
};

const malusStatMod = -5;
const calculateStatMod = (val: number): number => val + malusStatMod;
const calculateStatModToString = (val: number): string => addSymbol(calculateStatMod(val));

export {
  aggregateSkillsByStats,
  calculateStatMod,
  calculateStatModToString,
  curateCharacterSkills,
  getActualBody,
  getBaseSkillNode,
  getCharacterHpValues,
  getCyberFrameLevelsByNodes,
  malusStatMod,
};
