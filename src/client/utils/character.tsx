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

const getBaseSkillNode = (skill: ISkill): ICuratedNode | undefined => {
  const generalNodes = skill.branches.find((branch) => branch.skillBranch.title === '_general')
    ?.skillBranch.nodes;
  return generalNodes?.find(({ node }) => node.rank === 1);
};

const calculateStatMod = (val: number): number => val - 5;

export {
  aggregateSkillsByStats,
  calculateStatMod,
  getActualBody,
  getBaseSkillNode,
  getCharacterHpValues,
  getCyberFrameLevelsByNodes,
};
