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
  ICuratedDamageType,
  ICuratedItemModifier,
  ICuratedProgram,
  ICuratedProgramScope,
  ICuratedRarity,
  ICuratedSkill,
  ICuratedStat,
  ICuratedWeapon,
  ICuratedWeaponScope,
  ICuratedWeaponType,
  IDamage,
  IGlobalValue,
  INode,
  IProgram,
  IWeapon,
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

const isInteractiveDiceThrow = (roleDiceThrow: string): boolean =>
  roleDiceThrow.startsWith('skill-') ||
  roleDiceThrow.startsWith('stat-') ||
  roleDiceThrow === 'weapon' ||
  roleDiceThrow === 'program';

const getCharacterHpValues = ({
  character,
  cyberFrames,
  charParams,
  stats,
}: {
  character: ICharacter | null | false;
  cyberFrames: ICuratedCyberFrame[];
  charParams: ICuratedCharParam[];
  stats: ICuratedStat[];
}): IHpValues => {
  if (character === null || character === false || cyberFrames.length === 0) {
    return {
      hp: 0,
      total: 0,
      isLoading: true,
    };
  }

  const { body } = getActualBody(character);

  let hpValue = 0;
  let isLoading = true;
  let totalHpValue = 0;

  if (body !== undefined) {
    const curatedBody = curateCharacterBody({ body, cyberFrames, charParams, stats });
    hpValue = body.hp;
    totalHpValue +=
      curatedBody.cyberFrame.cyberFrame.charParams.find(
        ({ charParam }) => charParam.charParam.formulaId === 'hp'
      )?.value ?? 0;
    isLoading = false;
  }

  // character.nodes?.forEach(({ node }) => {
  //   node.charParamBonuses.forEach((charParamBonus) => {
  //     if (charParamBonus.charParam === hpParamId) {
  //       totalHpValue += charParamBonus.value;
  //     }
  //   });
  // });

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

    const bodySkillBonus = body.skills.find((bodySkill) => bodySkill.skill === skill._id);
    if (bodySkillBonus !== undefined) {
      relatedSkillBonuses.total += bodySkillBonus.value;
      relatedSkillBonuses.sources.push({
        value: bodySkillBonus.value,
        fromBody: true,
      });
    }

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

export interface ICompleteDamage extends Omit<IDamage, 'damageType'> {
  damageType: ICuratedDamageType | undefined;
}

interface ICompleteWeapon
  extends Omit<IWeapon, 'weaponType' | 'weaponScope' | 'itemModifiers' | 'rarity' | 'damages'> {
  weaponType?: ICuratedWeaponType;
  weaponScope?: ICuratedWeaponScope;
  itemModifiers?: ICuratedItemModifier[];
  rarity?: ICuratedRarity;
  damages: ICompleteDamage[];
}

interface ICuratedCompleteWeapon extends Omit<ICuratedWeapon, 'weapon'> {
  weapon: ICompleteWeapon;
}

const curateWeapon = ({
  weapon,
  weaponTypes,
  weaponScopes,
  rarities,
  itemModifiers,
  damageTypes,
}: {
  weapon: ICuratedWeapon;
  weaponTypes: ICuratedWeaponType[];
  weaponScopes: ICuratedWeaponScope[];
  rarities: ICuratedRarity[];
  itemModifiers: ICuratedItemModifier[];
  damageTypes: ICuratedDamageType[];
}): ICuratedCompleteWeapon | null => {
  if (weaponTypes.length === 0 || weaponScopes.length === 0) {
    return null;
  }
  const { weapon: weaponObj, i18n } = weapon;

  return {
    weapon: {
      ...weaponObj,
      weaponScope: weaponScopes.find(
        (weaponScope) => weaponScope.weaponScope._id === weaponObj.weaponScope
      ),
      weaponType: weaponTypes.find(
        (weaponType) => weaponType.weaponType._id === weaponObj.weaponType
      ),
      rarity: rarities.find((rarity) => rarity.rarity._id === weaponObj.rarity),
      // itemModifiers[0] should never occurs. wath out for this
      itemModifiers: weaponObj.itemModifiers?.map(
        (itemModifierId) =>
          itemModifiers.find((itemModifier) => itemModifier.itemModifier._id === itemModifierId) ??
          itemModifiers[0]
      ),
      damages: weaponObj.damages.map((weaponDamage) => ({
        ...weaponDamage,
        damageType: damageTypes.find(
          (damageType) => damageType.damageType._id === weaponDamage.damageType
        ),
      })),
    },
    i18n,
  };
};

interface ICompleteProgram extends Omit<IProgram, 'rarity' | 'programScope' | 'damages'> {
  rarity?: ICuratedRarity;
  programScope?: ICuratedProgramScope;
  damages?: ICompleteDamage[];
}

interface ICuratedCompleteProgram extends Omit<ICuratedProgram, 'program'> {
  program: ICompleteProgram;
}

const curateProgram = ({
  program,
  rarities,
  programScopes,
  damageTypes,
}: {
  program: ICuratedProgram;
  rarities: ICuratedRarity[];
  programScopes: ICuratedProgramScope[];
  damageTypes: ICuratedDamageType[];
}): ICuratedCompleteProgram => {
  const { program: programObj, i18n } = program;

  return {
    program: {
      ...programObj,
      programScope: programScopes.find(
        (programScope) => programScope.programScope._id === programObj.programScope
      ),
      rarity: rarities.find((rarity) => rarity.rarity._id === programObj.rarity),
      damages:
        programObj.damages !== undefined
          ? programObj.damages.map((programDamage) => ({
              ...programDamage,
              damageType: damageTypes.find(
                (damageType) => damageType.damageType._id === programDamage.damageType
              ),
            }))
          : undefined,
    },
    i18n,
  };
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
  curateWeapon,
  curateProgram,
  getActualBody,
  isInteractiveDiceThrow,
  getCharacterHpValues,
  getCyberFrameLevelsByNodes,
  arcaneNameToNodeIcon,
  malusStatMod,
};
