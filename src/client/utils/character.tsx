import { addSymbol, capitalizeFirstLetter } from '.';

import type {
  IActionDuration,
  IActionType,
  IBody,
  ICharacter,
  ICharacterNode,
  ICuratedAction,
  ICuratedBody,
  ICuratedCharParam,
  ICuratedCyberFrame,
  ICuratedSkill,
  ICuratedStat,
  IGlobalValue,
  INode,
} from '../types';
import type {
  ICompleteCyberFrame,
  ICuratedCyberFrameCharParam,
  ICuratedCyberFrameStat,
  TypeNodeIcons,
} from '../types/rules';

export interface ICyberFrameLevels {
  cyberFrame: ICuratedCyberFrame;
  level: number;
  chosenNodes: INode[];
}

const getCyberFrameLevelsByNodes = (
  nodes: ICharacterNode[] | undefined,
  cyberFrames: ICuratedCyberFrame[]
  // eslint-disable-next-line arrow-body-style --- temporary
): ICyberFrameLevels[] => {
  // if (nodes === undefined) {
  //   return [];
  // }
  // const tempFrames: Partial<Record<string, ICyberFrameLevels>> = {};
  // nodes.forEach(({ node }) => {
  //   if (node.cyberFrameBranch !== undefined) {
  //     const foundCyberFrame = cyberFrames.find(
  //       ({ cyberFrame }) =>
  //         cyberFrame.branches.find(
  //           ({ cyberFrameBranch }) => cyberFrameBranch._id === node.cyberFrameBranch
  //         ) !== undefined
  //     );

  //     if (foundCyberFrame !== undefined) {
  //       tempFrames[foundCyberFrame.cyberFrame._id] = {
  //         cyberFrame: foundCyberFrame,
  //         level: (tempFrames[foundCyberFrame.cyberFrame._id]?.level ?? 0) + 1,
  //         chosenNodes: [...(tempFrames[foundCyberFrame.cyberFrame._id]?.chosenNodes ?? []), node],
  //       };
  //     }
  //   }
  // });

  // return Object.values(tempFrames).filter((tempFrame) => tempFrame !== undefined);
  return [];
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
    node.charParamBonuses.forEach((charParamBonus) => {
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

export interface ISkillStats {
  stat: ICuratedStat;
  skills: ICuratedSkill[];
}

const aggregateSkillsByStats = (skills: ICuratedSkill[], stats: ICuratedStat[]): ISkillStats[] => {
  if (skills.length === 0) {
    return [];
  }
  const tempAggregatedStats: Partial<Record<string, ISkillStats>> = {};
  skills.forEach(({ skill, i18n }) => {
    const relatedStat = stats.find(({ stat }) => stat._id === skill.stat._id);
    if (relatedStat !== undefined) {
      tempAggregatedStats[skill.stat._id] = {
        stat: relatedStat,
        skills: [
          ...(tempAggregatedStats[skill.stat._id]?.skills ?? []),
          {
            skill,
            i18n,
          },
        ],
      };
    }
  });

  return Object.values(tempAggregatedStats).filter(
    (tempAggregatedStat) => tempAggregatedStat !== undefined
  );
};

const getActualBody = (
  character?: ICharacter
): {
  body: IBody | undefined;
  duplicate: boolean;
} => {
  if (character === undefined) {
    return {
      body: undefined,
      duplicate: false,
    };
  }
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
  fromBackground?: boolean;
  details?: string;
}

export interface IScore {
  total: number;
  sources: ISourcePoints[];
}

export type ICuratedStatWithScore = ICuratedStat & { score: IScore };

export type ICuratedSkillWithScore = ICuratedSkill & {
  score: IScore;
  stat: ICuratedStatWithScore;
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
    return {
      stats: [],
      skills: [],
    };
  }
  const { body } = getActualBody(character);
  if (body === undefined) {
    return {
      stats: [],
      skills: [],
    };
  }

  const skillsById: Record<string, IScore | undefined> = {};
  const statsById: Record<string, IScore | undefined> = {};

  character.stats.forEach(({ stat, value }) => {
    statsById[stat] = {
      total: value,
      sources: [
        {
          value,
          fromBody: true,
        },
      ],
    };
  });

  // TODO: Reactivate this when we know what we will do about nodes
  // character.nodes?.forEach(({ node }) => {
  //   let foundCyberFrame: ICuratedCyberFrame | undefined;
  //   let foundSkill: ICuratedSkill | undefined;
  //   if (node.cyberFrameBranch !== undefined) {
  //     foundCyberFrame = cyberFrames.find(
  //       ({ cyberFrame }) =>
  //         cyberFrame.branches.find(
  //           ({ cyberFrameBranch }) => cyberFrameBranch._id === node.cyberFrameBranch
  //         ) !== undefined
  //     );
  //   }
  //   if (node.skillBranch !== undefined) {
  //     foundSkill = skills.find(
  //       ({ skill }) =>
  //         skill.branches.find(({ skillBranch }) => skillBranch._id === node.skillBranch) !==
  //         undefined
  //     );
  //   }
  //   node.skillBonuses.forEach((skillBonus) => {
  //     const actualSkillNode = skillNodesById[skillBonus.skill];
  //     skillNodesById[skillBonus.skill] = {
  //       total: (actualSkillNode?.total ?? 0) + skillBonus.value,
  //       sources: [
  //         ...(actualSkillNode?.sources ?? []),
  //         {
  //           value: skillBonus.value,
  //           origin: {
  //             ...node,
  //             cyberFrame: foundCyberFrame,
  //             skill: foundSkill,
  //           },
  //         },
  //       ],
  //     };
  //   });
  //   node.statBonuses.forEach((statBonus) => {
  //     statNodesById[statBonus.stat].total += statBonus.value;
  //     statNodesById[statBonus.stat].sources.push({
  //       value: statBonus.value,
  //       origin: {
  //         ...node,
  //         cyberFrame: foundCyberFrame,
  //         skill: foundSkill,
  //       },
  //     });
  //   });
  // });

  const charStats: Record<string, ICuratedStatWithScore | undefined> = {};
  const charSkills: ICuratedSkillWithScore[] = [];
  skills.forEach(({ skill, i18n }) => {
    const relatedStat = stats.find(({ stat }) => stat._id === skill.stat._id);
    const relatedStatBonuses = statsById[skill.stat._id] ?? {
      total: 0,
      sources: [],
    };
    const relatedSkillBonuses = skillsById[skill._id] ?? {
      total: 0,
      sources: [],
    };
    if (relatedStat !== undefined) {
      charStats[skill.stat._id] ??= {
        ...relatedStat,
        score: relatedStatBonuses,
      };

      const score: IScore = {
        total: calculateStatMod(relatedStatBonuses.total) + relatedSkillBonuses.total,
        sources: [
          {
            value: calculateStatMod(relatedStatBonuses.total),
            fromStat: true,
          },
          ...relatedSkillBonuses.sources,
        ],
      };
      charSkills.push({
        skill,
        i18n,
        score,
        stat: {
          ...relatedStat,
          score: relatedStatBonuses,
        },
      });
    }
  });

  return {
    stats: Object.values(charStats).filter((charStat) => charStat !== undefined),
    skills: charSkills,
  };
};

const curateCharacterParams = ({
  character,
  charParams,
  charParamList,
  skills,
  stats,
  cyberFrames,
  globalValues,
}: {
  character: false | ICharacter | null;
  charParams: ICuratedCharParam[];
  charParamList: string[];
  skills: ICuratedSkillWithScore[];
  stats: ICuratedStatWithScore[];
  cyberFrames: ICuratedCyberFrame[];
  globalValues: IGlobalValue[];
}): ICuratedCharParamWithScore[] => {
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
      const { formulaId } = associatedCharParam.charParam;
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

  // TODO: Reactivate this when we know what we will do about nodes
  // character.nodes?.forEach(({ node }) => {
  //   let foundCyberFrame: ICuratedCyberFrame | undefined;
  //   let foundSkill: ICuratedSkill | undefined;
  //   if (node.cyberFrameBranch !== undefined) {
  //     foundCyberFrame = cyberFrames.find(
  //       ({ cyberFrame }) =>
  //         cyberFrame.branches.find(
  //           ({ cyberFrameBranch }) => cyberFrameBranch._id === node.cyberFrameBranch
  //         ) !== undefined
  //     );
  //   }
  //   if (node.skillBranch !== undefined) {
  //     foundSkill = skills.find(
  //       ({ skill }) =>
  //         skill.branches.find(({ skillBranch }) => skillBranch._id === node.skillBranch) !==
  //         undefined
  //     );
  //   }
  //   node.charParamBonuses.forEach((charParamBonus) => {
  //     if (
  //       (charParamsById[charParamBonus.charParam] as ICuratedCharParamWithScore | undefined) !==
  //       undefined
  //     ) {
  //       charParamsById[charParamBonus.charParam].score.total += charParamBonus.value;
  //       charParamsById[charParamBonus.charParam].score.sources.push({
  //         value: charParamBonus.value,
  //         origin: {
  //           ...node,
  //           cyberFrame: foundCyberFrame,
  //           skill: foundSkill,
  //         },
  //       });
  //     }
  //   });
  // });

  return Object.values(charParamsById);
};

const curateCharacterAction = ({
  action,
  actionTypes,
  actionDurations,
}: {
  action: ICuratedAction;
  actionTypes: IActionType[];
  actionDurations: IActionDuration[];
}): ICuratedAction => ({
  ...action,
  action: {
    ...action.action,
    duration:
      actionDurations.find((actionDuration) => actionDuration._id === action.action.duration)
        ?.name ?? 'free',
    type:
      actionTypes.find((actionType) => actionType._id === action.action.type)?.name ?? 'utility',
  },
});

const curateCyberFrame = ({
  cyberFrame,
  charParams,
  stats,
}: {
  cyberFrame: ICuratedCyberFrame;
  charParams: ICuratedCharParam[];
  stats: ICuratedStat[];
}): ICompleteCyberFrame => {
  const curatedCyberFrameCharParams: ICuratedCyberFrameCharParam[] = [];
  const curatedCyberFrameStats: ICuratedCyberFrameStat[] = [];

  cyberFrame.cyberFrame.charParams.forEach((cFrameCharParam) => {
    const foundCharParam = charParams.find(
      (charParam) => charParam.charParam._id === cFrameCharParam.charParam
    );
    if (foundCharParam !== undefined) {
      curatedCyberFrameCharParams.push({
        ...cFrameCharParam,
        charParam: foundCharParam,
      });
    }
  });

  cyberFrame.cyberFrame.stats.forEach((cFrameStat) => {
    const foundStat = stats.find((stat) => stat.stat._id === cFrameStat.stat);
    if (foundStat !== undefined) {
      curatedCyberFrameStats.push({
        ...cFrameStat,
        stat: foundStat,
      });
    }
  });

  return {
    i18n: cyberFrame.i18n,
    cyberFrame: {
      ...cyberFrame.cyberFrame,
      charParams: curatedCyberFrameCharParams,
      stats: curatedCyberFrameStats,
    },
  };
};

const curateCharacterBody = ({
  body,
  cyberFrames,
  charParams,
  stats,
}: {
  body: IBody;
  cyberFrames: ICuratedCyberFrame[];
  charParams: ICuratedCharParam[];
  stats: ICuratedStat[];
}): ICuratedBody => {
  const foundCyberFrame = cyberFrames.find((cFrame) => cFrame.cyberFrame._id === body.cyberFrame);
  if (foundCyberFrame === undefined) {
    console.error(
      'No BioFrame found on curateCharacterBody. Using the first cyberframe as a fallback...'
    );
  }

  return {
    ...body,
    cyberFrame: curateCyberFrame({
      cyberFrame: foundCyberFrame ?? cyberFrames[0],
      charParams,
      stats,
    }),
  };
};

const arcaneNameToNodeIcon = (arcanaName: string): TypeNodeIcons => {
  const table: Record<string, TypeNodeIcons> = {
    wisdom: 'star',
    courage: 'flame',
    justice: 'scale',
    temperance: 'hourglass',
  };

  return table[arcanaName];
};

const malusStatMod = 0;
const calculateStatMod = (val: number): number => val + malusStatMod;
const calculateStatModToString = (val: number): string => addSymbol(calculateStatMod(val));

export {
  aggregateSkillsByStats,
  calculateStatMod,
  calculateStatModToString,
  curateCharacterParams,
  curateCharacterSkills,
  curateCharacterAction,
  curateCharacterBody,
  curateCyberFrame,
  getActualBody,
  getCharacterHpValues,
  getCyberFrameLevelsByNodes,
  arcaneNameToNodeIcon,
  malusStatMod,
};
