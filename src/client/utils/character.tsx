import { addSymbol, capitalizeFirstLetter } from '.';

import type {
  IBody,
  ICharacter,
  ICharacterNode,
  ICuratedCharParam,
  ICuratedCyberFrame,
  ICuratedNode,
  ICuratedSkill,
  ICuratedStat,
  IGlobalValue,
  INode,
  ISkill,
} from '../types';


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
  const relevantBodies = character.bodies?.filter((body) => body.alive);
  return {
    body: relevantBodies?.[0] ?? undefined,
    duplicate: relevantBodies !== undefined && relevantBodies.length > 1,
  };
};

export interface ISourcePoints {
  value: number;
  origin?: INode & {
    cyberFrame?: ICuratedCyberFrame;
    skill?: ICuratedSkill;
  };
  fromBody?: boolean;
  fromStat?: boolean;
  fromThrottleStat?: boolean;
  fromBase?: boolean;
}

export interface IScore {
  total: number;
  sources: ISourcePoints[];
}

export type ICuratedStatWithScore = ICuratedStat & {
  score: IScore;
};

export type ICuratedSkillWithScore = ICuratedSkill & {
  score: IScore;
  stat: ICuratedStat;
};

export type ICuratedCharParamWithScore = ICuratedCharParam & {
  score: IScore;
  stat?: ICuratedStat;
};

const curateCharacterSkills = (
  character: false | ICharacter | null,
  skills: ICuratedSkill[],
  stats: ICuratedStat[],
  cyberFrames: ICuratedCyberFrame[]
): {
  stats: ICuratedStatWithScore[];
  skills: ICuratedSkillWithScore[];
} => {
  if (character === false || character === null) {
    return { stats: [], skills: [] };
  }
  const { body } = getActualBody(character);
  if (body === undefined) {
    return { stats: [], skills: [] };
  }

  const skillNodesById: Record<string, IScore> = {};
  const statNodesById: Record<string, IScore> = {};

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
  const charStats: Record<string, ICuratedStatWithScore> = {};
  const charSkills: ICuratedSkillWithScore[] = [];
  skills.forEach(({ skill, i18n }) => {
    const relatedStat = stats.find(({ stat }) => stat._id === skill.stat._id);
    const relatedStatBonuses = statNodesById[skill.stat._id];
    const relatedSkillBonuses = skillNodesById[skill._id];
    if (relatedStat !== undefined) {
      if (charStats[skill.stat._id] === undefined) {
        charStats[skill.stat._id] = {
          ...relatedStat,
          score: relatedStatBonuses,
        };
      }
      const score = {
        total: calculateStatMod(relatedStatBonuses.total) + (relatedSkillBonuses.total ?? 0),
        sources: [
          {
            value: calculateStatMod(relatedStatBonuses.total),
            fromStat: true,
          },
          ...(relatedSkillBonuses.sources ?? []),
        ],
      };
      charSkills.push({
        skill,
        i18n,
        score,
        stat: charStats[skill.stat._id],
      });
    }
  });
  return { stats: Object.values(charStats), skills: charSkills };
};

const curateCharacterParams = (
  character: false | ICharacter | null,
  charParams: ICuratedCharParam[],
  charParamList: string[],
  skills: ICuratedSkillWithScore[],
  stats: ICuratedStatWithScore[],
  cyberFrames: ICuratedCyberFrame[],
  globalValues: IGlobalValue[]
): ICuratedCharParamWithScore[] => {
  if (character === false || character === null) {
    return [];
  }
  const { body } = getActualBody(character);
  if (body === undefined) {
    return [];
  }

  const charParamsById: Record<string, ICuratedCharParamWithScore> = {};

  // The correlated stats to add to the charParams, as a bonus
  const correlatingCharParamStat = {
    pyr: 'dex',
    arr: 'fee',
  };

  charParamList.forEach((charParamId) => {
    const associatedCharParam = charParams.find(
      ({ charParam }) => charParam.formulaId === charParamId
    );
    if (associatedCharParam !== undefined) {
      const id = associatedCharParam.charParam._id;
      const {formulaId} = associatedCharParam.charParam;
      if (charParamList.includes(formulaId)) {
        let value = 0;
        const globalValueBonus =
          globalValues.find(
            (globalValue) => globalValue.name === `base${capitalizeFirstLetter(formulaId)}`
          )?.value ?? 0;
        value += Number(globalValueBonus);
        charParamsById[id] = {
          ...associatedCharParam,
          score: {
            total: value,
            sources: [],
          },
        };

        if (value !== 0) {
          charParamsById[id].score.sources.push({
            value,
            fromBase: true,
          });
        }

        if (correlatingCharParamStat[formulaId] !== undefined) {
          const relatedStat = stats.find(
            ({ stat }) => stat.formulaId === correlatingCharParamStat[formulaId]
          );
          if (relatedStat !== undefined) {
            charParamsById[id].score.total += calculateStatMod(relatedStat.score.total);
            charParamsById[id].score.sources.push({
              value: calculateStatMod(relatedStat.score.total),
              fromStat: true,
            });
            charParamsById[id].stat = relatedStat;
          }
        }
      }
    }
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
    node.charParamBonuses?.forEach((charParamBonus) => {
      if (charParamsById[charParamBonus.charParam] !== undefined) {
        charParamsById[charParamBonus.charParam].score.total += charParamBonus.value;
        charParamsById[charParamBonus.charParam].score.sources.push({
          value: charParamBonus.value,
          origin: {
            ...node,
            cyberFrame: foundCyberFrame,
            skill: foundSkill,
          },
        });
      }
    });
  });
  return Object.values(charParamsById);
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
  curateCharacterParams,
  curateCharacterSkills,
  getActualBody,
  getBaseSkillNode,
  getCharacterHpValues,
  getCyberFrameLevelsByNodes,
  malusStatMod,
};
