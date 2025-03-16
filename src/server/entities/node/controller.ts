import type { Request, Response } from 'express';

import db from '../../models';
import { gemInvalidField, gemNotFound, gemServerError } from '../../utils/globalErrorMessage';
import { type ISentAction, smartUpdateActions } from '../action/controller';
import { curateCharParamBonusIds } from '../charParamBonus/controller';
import { findCyberFrameBranchesByFrame } from '../cyberFrameBranch/controller';
import { type ISentEffect, smartUpdateEffects } from '../effect/controller';
import { curateSkillBonusIds } from '../skillBonus/controller';
import { findSkillBranchesBySkill } from '../skillBranch/controller';
import { curateStatBonusIds } from '../statBonus/controller';

import type { InternationalizationType } from '../../utils/types';
import type {
  HydratedIAction,
  HydratedICharParamBonus,
  HydratedIEffect,
  HydratedISkillBonus,
  HydratedIStatBonus,
  IAction,
  ICharParamBonus,
  ICyberFrameBranch,
  IEffect,
  ISkillBonus,
  ISkillBranch,
  IStatBonus,
} from '../index';
import type { HydratedINode, LeanINode } from './model';

import { curateI18n } from '../../utils';

const { Node } = db;

interface findAllPayload {
  cyberFrameBranch?: string | Record<string, string[]>;
  skillBranch?: string | Record<string, string[]>;
}

const findNodes = async (options?: findAllPayload): Promise<LeanINode[]> =>
  await new Promise((resolve, reject) => {
    Node.find(options ?? {})
      .lean()
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: Array<IAction<string>> }>('actions')
      .populate<{ skillBonuses: ISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: IStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: ICharParamBonus[] }>('charParamBonuses')
      .then((res: LeanINode[]) => {
        if (res.length === 0) {
          reject(gemNotFound('Nodes'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findCompleteNodeById = async (id: string): Promise<HydratedINode> =>
  await new Promise((resolve, reject) => {
    Node.findById(id)
      .populate<{ effects: HydratedIEffect[] }>('effects')
      .populate<{ actions: HydratedIAction[] }>('actions')
      .populate<{ skillBonuses: HydratedISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: HydratedIStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: HydratedICharParamBonus[] }>('charParamBonuses')
      .populate<{ skillBranch: ISkillBranch<string> }>('skillBranch')
      .populate<{ cyberFrameBranch: ICyberFrameBranch<string> }>('cyberFrameBranch')
      .then((res?: HydratedINode | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Node'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findNodeById = async (id: string): Promise<LeanINode> =>
  await new Promise((resolve, reject) => {
    Node.findById(id)
      .lean()
      .populate<{ effects: IEffect[] }>('effects')
      .populate<{ actions: Array<IAction<string>> }>('actions')
      .populate<{ skillBonuses: ISkillBonus[] }>('skillBonuses')
      .populate<{ statBonuses: IStatBonus[] }>('statBonuses')
      .populate<{ charParamBonuses: ICharParamBonus[] }>('charParamBonuses')
      .populate<{ skillBranch: ISkillBranch<string> }>('skillBranch')
      .populate<{ cyberFrameBranch: ICyberFrameBranch<string> }>('cyberFrameBranch')
      .then((res?: LeanINode | null) => {
        if (res === undefined || res === null) {
          reject(gemNotFound('Node'));
        } else {
          resolve(res);
        }
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const create = (req: Request, res: Response): void => {
  const {
    title,
    summary,
    icon,
    quote,
    i18n = null,
    skillBranch,
    cyberFrameBranch,
    rank,
    effects,
    actions,
    skillBonuses,
    statBonuses,
    charParamBonuses,
    overrides,
  } = req.body;
  if (
    title === undefined ||
    summary === undefined ||
    (skillBranch === undefined && cyberFrameBranch === undefined) ||
    rank === undefined
  ) {
    res.status(400).send(gemInvalidField('Node'));

    return;
  }

  const node = new Node({
    title,
    summary,
    icon,
    quote,
    skillBranch,
    cyberFrameBranch,
    rank,
    overrides,
  });

  if (i18n !== null) {
    node.i18n = JSON.stringify(i18n);
  }

  curateSkillBonusIds({
    skillBonusesToRemove: [],
    skillBonusesToStay: [],
    skillBonusesToAdd: skillBonuses as Array<{
      skill: string;
      value: number;
    }>,
  })
    .then((skillBonusIds) => {
      if (skillBonusIds.length > 0) {
        node.skillBonuses = skillBonusIds.map((skillBonusId) => String(skillBonusId));
      }
      curateStatBonusIds({
        statBonusesToRemove: [],
        statBonusesToStay: [],
        statBonusesToAdd: statBonuses as Array<{
          stat: string;
          value: number;
        }>,
      })
        .then((statBonusIds) => {
          if (statBonusIds.length > 0) {
            node.statBonuses = statBonusIds.map((statBonusId) => String(statBonusId));
          }
          curateCharParamBonusIds({
            charParamBonusesToRemove: [],
            charParamBonusesToStay: [],
            charParamBonusesToAdd: charParamBonuses as Array<{
              charParam: string;
              value: number;
            }>,
          })
            .then((charParamBonusIds) => {
              if (charParamBonusIds.length > 0) {
                node.charParamBonuses = charParamBonusIds.map((charParamBonusId) =>
                  String(charParamBonusId)
                );
              }
              smartUpdateEffects({
                effectsToRemove: [],
                effectsToUpdate: effects,
              })
                .then((effectsIds) => {
                  if (effectsIds.length > 0) {
                    node.effects = effectsIds.map((effectsId) => String(effectsId));
                  }
                  smartUpdateActions({
                    actionsToRemove: [],
                    actionsToUpdate: actions,
                  })
                    .then((actionsIds) => {
                      if (actionsIds.length > 0) {
                        node.actions = actionsIds.map((actionsId) => String(actionsId));
                      }
                      node
                        .save()
                        .then(() => {
                          res.send(node);
                        })
                        .catch((err: unknown) => {
                          res.status(500).send(gemServerError(err));
                        });
                    })
                    .catch((err: unknown) => {
                      res.status(500).send(gemServerError(err));
                    });
                })
                .catch((err: unknown) => {
                  res.status(500).send(gemServerError(err));
                });
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch((err: unknown) => {
      res.status(500).send(gemServerError(err));
    });
};

const update = (req: Request, res: Response): void => {
  const {
    id,
    title = null,
    summary = null,
    icon = null,
    quote = null,
    i18n,
    skillBranch = null,
    cyberFrameBranch = null,
    rank = null,
    effects = null,
    actions = null,
    skillBonuses = null,
    statBonuses = null,
    charParamBonuses = null,
    overrides = null,
  }: {
    id?: string;
    title: string | null;
    summary: string | null;
    icon: string | null;
    quote: string | null;
    i18n: InternationalizationType | null;
    skillBranch: string | null;
    cyberFrameBranch: string | null;
    rank: number | null;
    effects: ISentEffect[] | null;
    actions: ISentAction[] | null;
    skillBonuses: Array<{
      skill: string;
      value: number;
    }> | null;
    statBonuses: Array<{
      stat: string;
      value: number;
    }> | null;
    charParamBonuses: Array<{
      charParam: string;
      value: number;
    }> | null;
    overrides: string[] | null;
  } = req.body;
  if (id === undefined) {
    res.status(400).send(gemInvalidField('Node ID'));

    return;
  }

  findCompleteNodeById(id)
    .then((node) => {
      if (title !== null) {
        node.title = title;
      }
      if (icon !== null) {
        node.icon = icon;
      }
      if (summary !== null) {
        node.summary = summary;
      }
      if (quote !== null) {
        node.quote = quote;
      }
      if (skillBranch !== null) {
        node.skillBranch = skillBranch;
      }
      if (cyberFrameBranch !== null) {
        node.cyberFrameBranch = cyberFrameBranch;
      }
      if (rank !== null) {
        node.rank = rank;
      }
      if (overrides !== null) {
        node.overrides = overrides;
      }

      const skillBonusesToStay: string[] = [];
      let skillBonusesToRemove: string[] = [];
      let skillBonusesToAdd: Array<{
        skill: string;
        value: number;
      }> = [];

      if (skillBonuses !== null) {
        skillBonusesToRemove = node.skillBonuses.reduce(
          (result: string[], elt: HydratedISkillBonus) => {
            const foundSkillBonus = skillBonuses.find(
              (skillBonus) =>
                skillBonus.skill === String(elt.skill) && skillBonus.value === elt.value
            );
            if (foundSkillBonus === undefined) {
              result.push(String(elt._id));
            } else {
              skillBonusesToStay.push(String(elt._id));
            }

            return result;
          },
          []
        );

        skillBonusesToAdd = skillBonuses.reduce(
          (
            result: Array<{
              skill: string;
              value: number;
            }>,
            elt: {
              skill: string;
              value: number;
            }
          ) => {
            const foundSkillBonus = node.skillBonuses.find(
              (skillBonus) =>
                typeof skillBonus !== 'string' &&
                String(skillBonus.skill) === elt.skill &&
                skillBonus.value === elt.value
            );
            if (foundSkillBonus === undefined) {
              result.push(elt);
            }

            return result;
          },
          []
        );
      }

      const statBonusesToStay: string[] = [];
      let statBonusesToRemove: string[] = [];
      let statBonusesToAdd: Array<{
        stat: string;
        value: number;
      }> = [];

      if (statBonuses !== null) {
        statBonusesToRemove = node.statBonuses.reduce(
          (result: string[], elt: HydratedIStatBonus) => {
            const foundStatBonus = statBonuses.find(
              (statBonus) => statBonus.stat === String(elt.stat) && statBonus.value === elt.value
            );
            if (foundStatBonus === undefined) {
              result.push(String(elt._id));
            } else {
              statBonusesToStay.push(String(elt._id));
            }

            return result;
          },
          []
        );

        statBonusesToAdd = statBonuses.reduce(
          (
            result: Array<{
              stat: string;
              value: number;
            }>,
            elt: {
              stat: string;
              value: number;
            }
          ) => {
            const foundStatBonus = node.statBonuses.find(
              (statBonus) =>
                typeof statBonus !== 'string' &&
                String(statBonus.stat) === elt.stat &&
                statBonus.value === elt.value
            );
            if (foundStatBonus === undefined) {
              result.push(elt);
            }

            return result;
          },
          []
        );
      }

      const charParamBonusesToStay: string[] = [];
      let charParamBonusesToRemove: string[] = [];
      let charParamBonusesToAdd: Array<{
        charParam: string;
        value: number;
      }> = [];
      if (charParamBonuses !== null) {
        charParamBonusesToRemove = node.charParamBonuses.reduce(
          (result: string[], elt: HydratedICharParamBonus) => {
            const foundCharParamBonus = charParamBonuses.find(
              (charParamBonus) =>
                charParamBonus.charParam === String(elt.charParam) &&
                charParamBonus.value === elt.value
            );
            if (foundCharParamBonus === undefined) {
              result.push(String(elt._id));
            } else {
              charParamBonusesToStay.push(String(elt._id));
            }

            return result;
          },
          []
        );

        charParamBonusesToAdd = charParamBonuses.reduce(
          (
            result: Array<{
              charParam: string;
              value: number;
            }>,
            elt: {
              charParam: string;
              value: number;
            }
          ) => {
            const foundCharParamBonus = node.charParamBonuses.find(
              (charParamBonus) =>
                typeof charParamBonus !== 'string' &&
                String(charParamBonus.charParam) === elt.charParam &&
                charParamBonus.value === elt.value
            );
            if (foundCharParamBonus === undefined) {
              result.push(elt);
            }

            return result;
          },
          []
        );
      }

      let effectsToRemove: string[] = [];

      if (effects !== null) {
        effectsToRemove = node.effects.reduce((result: string[], elt: HydratedIEffect) => {
          const foundEffect = effects.find(
            (effect) => effect.id !== undefined && String(effect.id) === String(elt._id)
          );
          if (foundEffect === undefined) {
            result.push(String(elt._id));
          }

          return result;
        }, []);
      }

      let actionsToRemove: string[] = [];

      if (actions !== null) {
        actionsToRemove = node.actions.reduce((result: string[], elt: HydratedIAction) => {
          const foundAction = actions.find(
            (action) => action.id !== undefined && String(action.id) === String(elt._id)
          );
          if (foundAction === undefined) {
            result.push(String(elt._id));
          }

          return result;
        }, []);
      }

      if (i18n !== null) {
        const newIntl: InternationalizationType = {
          ...(node.i18n !== undefined && node.i18n !== '' ? JSON.parse(node.i18n) : {}),
        };

        Object.keys(i18n).forEach((lang) => {
          newIntl[lang] = i18n[lang];
        });

        node.i18n = JSON.stringify(newIntl);
      }
      curateSkillBonusIds({
        skillBonusesToRemove,
        skillBonusesToAdd,
        skillBonusesToStay,
      })
        .then((skillBonusIds) => {
          if (skillBonusIds.length > 0) {
            node.skillBonuses = skillBonusIds.map((skillBonusId) => String(skillBonusId));
          } else if (skillBonuses !== null && skillBonuses.length === 0) {
            node.skillBonuses = [];
          }
          curateStatBonusIds({
            statBonusesToRemove,
            statBonusesToAdd,
            statBonusesToStay,
          })
            .then((statBonusIds) => {
              if (statBonusIds.length > 0) {
                node.statBonuses = statBonusIds.map((statBonusId) => String(statBonusId));
              }
              curateCharParamBonusIds({
                charParamBonusesToRemove,
                charParamBonusesToAdd,
                charParamBonusesToStay,
              })
                .then((charParamBonusIds) => {
                  if (charParamBonusIds.length > 0) {
                    node.charParamBonuses = charParamBonusIds.map((charParamBonusId) =>
                      String(charParamBonusId)
                    );
                  }
                  smartUpdateEffects({
                    effectsToRemove,
                    effectsToUpdate: effects ?? [],
                  })
                    .then((effectsIds) => {
                      if (effectsIds.length > 0) {
                        node.effects = effectsIds.map((effectsId) => String(effectsId));
                      }
                      smartUpdateActions({
                        actionsToRemove,
                        actionsToUpdate: actions ?? [],
                      })
                        .then((actionsIds) => {
                          if (actionsIds.length > 0) {
                            node.actions = actionsIds.map((actionsId) => String(actionsId));
                          }
                          node
                            .save()
                            .then(() => {
                              res.send({
                                message: 'Node was updated successfully!',
                                node,
                              });
                            })
                            .catch((err: unknown) => {
                              res.status(500).send(gemServerError(err));
                            });
                        })
                        .catch((err: unknown) => {
                          res.status(500).send(gemServerError(err));
                        });
                    })
                    .catch((err: unknown) => {
                      res.status(500).send(gemServerError(err));
                    });
                })
                .catch((err: unknown) => {
                  res.status(500).send(gemServerError(err));
                });
            })
            .catch((err: unknown) => {
              res.status(500).send(gemServerError(err));
            });
        })
        .catch((err: unknown) => {
          res.status(500).send(gemServerError(err));
        });
    })
    .catch(() => {
      res.status(404).send(gemNotFound('Node'));
    });
};

const deleteNodeById = async (id?: string): Promise<boolean> =>
  await new Promise((resolve, reject) => {
    if (id === undefined) {
      reject(gemInvalidField('Node ID'));

      return;
    }
    Node.findByIdAndDelete(id)
      .then(() => {
        resolve(true);
      })
      .catch((err: unknown) => {
        reject(gemServerError(err));
      });
  });

const deleteNode = (req: Request, res: Response): void => {
  const { id }: { id: string } = req.body;

  findCompleteNodeById(id)
    .then(
      (
        node: Omit<
          HydratedINode,
          'effects' | 'actions' | 'skillBonuses' | 'statBonuses' | 'charParamBonuses'
        > & {
          effects: HydratedIEffect[];
          actions: HydratedIAction[];
          skillBonuses: HydratedISkillBonus[];
          statBonuses: HydratedIStatBonus[];
          charParamBonuses: HydratedICharParamBonus[];
        }
      ) => {
        const skillBonusesToRemove = node.skillBonuses.map((elt) => String(elt._id));
        const statBonusesToRemove = node.statBonuses.map((elt) => String(elt._id));
        const charParamBonusesToRemove = node.charParamBonuses.map((elt) => String(elt._id));
        const effectsToRemove = node.effects.map((elt) => String(elt._id));
        const actionsToRemove = node.actions.map((elt) => String(elt._id));

        curateSkillBonusIds({
          skillBonusesToRemove,
          skillBonusesToAdd: [],
          skillBonusesToStay: [],
        })
          .then(() => {
            curateStatBonusIds({
              statBonusesToRemove,
              statBonusesToAdd: [],
              statBonusesToStay: [],
            })
              .then(() => {
                curateCharParamBonusIds({
                  charParamBonusesToRemove,
                  charParamBonusesToAdd: [],
                  charParamBonusesToStay: [],
                })
                  .then(() => {
                    smartUpdateEffects({
                      effectsToRemove,
                      effectsToUpdate: [],
                    })
                      .then(() => {
                        smartUpdateActions({
                          actionsToRemove,
                          actionsToUpdate: [],
                        })
                          .then(() => {
                            deleteNodeById(id)
                              .then(() => {
                                res.send({ message: 'Node was deleted successfully!' });
                              })
                              .catch((err: unknown) => {
                                res.status(500).send(gemServerError(err));
                              });
                          })
                          .catch((err: unknown) => {
                            res.status(500).send(gemServerError(err));
                          });
                      })
                      .catch((err: unknown) => {
                        res.status(500).send(gemServerError(err));
                      });
                  })
                  .catch((err: unknown) => {
                    res.status(500).send(gemServerError(err));
                  });
              })
              .catch((err: unknown) => {
                res.status(500).send(gemServerError(err));
              });
          })
          .catch((err: unknown) => {
            res.status(500).send(gemServerError(err));
          });
      }
    )
    .catch(() => {
      res.status(404).send(gemNotFound('Node'));
    });
};

export interface CuratedINodeToSend {
  node: Omit<LeanINode, 'effects' | 'actions'> & {
    effects: Array<{
      effect: IEffect;
      i18n?: InternationalizationType;
    }>;
    actions: Array<{
      action: IAction<string>;
      i18n?: InternationalizationType;
    }>;
  };
  i18n?: InternationalizationType;
}

export const curateSingleNode = (nodeSent: LeanINode): CuratedINodeToSend => {
  const curatedActions =
    nodeSent.actions.length > 0
      ? nodeSent.actions.map((action) => ({
          action,
          i18n: curateI18n(action.i18n),
        }))
      : [];
  const curatedEffects =
    nodeSent.effects.length > 0
      ? nodeSent.effects.map((effect) => ({
          effect,
          i18n: curateI18n(effect.i18n),
        }))
      : [];

  return {
    node: {
      ...nodeSent,
      actions: curatedActions,
      effects: curatedEffects,
    },
    i18n: curateI18n(nodeSent.i18n),
  };
};

const findSingle = (req: Request, res: Response): void => {
  const { nodeId } = req.query;
  if (nodeId === undefined || typeof nodeId !== 'string') {
    res.status(400).send(gemInvalidField('Node ID'));

    return;
  }
  findNodeById(nodeId)
    .then((nodeSent) => {
      res.send(curateSingleNode(nodeSent));
    })
    .catch((err: unknown) => {
      res.status(404).send(err);
    });
};

const findAll = (req: Request, res: Response): void => {
  findNodes()
    .then((nodes) => {
      const curatedNodes: CuratedINodeToSend[] = [];
      nodes.forEach((nodeSent) => {
        curatedNodes.push(curateSingleNode(nodeSent));
      });

      res.send(curatedNodes);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAllByBranch = (req: Request, res: Response): void => {
  const { cyberFrameBranchId, skillBranchId } = req.query as {
    cyberFrameBranchId?: string;
    skillBranchId?: string;
  };
  if (cyberFrameBranchId === undefined && skillBranchId === undefined) {
    res.status(400).send(gemInvalidField('ID'));

    return;
  }
  findNodes({
    cyberFrameBranch: cyberFrameBranchId,
    skillBranch: skillBranchId,
  })
    .then((nodes) => {
      const curatedNodes: CuratedINodeToSend[] = [];

      nodes.forEach((nodeSent) => {
        curatedNodes.push(curateSingleNode(nodeSent));
      });

      res.send(curatedNodes);
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAndCurateNodesByParent = async ({
  cyberFrameBranchIds,
  skillBranchIds,
}: {
  cyberFrameBranchIds?: string[];
  skillBranchIds?: string[];
}): Promise<CuratedINodeToSend[]> =>
  await new Promise((resolve, reject) => {
    const opts: findAllPayload = {};
    if (skillBranchIds !== undefined) {
      opts.skillBranch = { $in: skillBranchIds };
    }
    if (cyberFrameBranchIds !== undefined) {
      opts.cyberFrameBranch = { $in: cyberFrameBranchIds };
    }
    findNodes(opts)
      .then((nodes) => {
        const curatedNodes: CuratedINodeToSend[] = [];

        nodes.forEach((nodeSent) => {
          curatedNodes.push(curateSingleNode(nodeSent));
        });
        resolve(curatedNodes);
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });

const findAllBySkill = (req: Request, res: Response): void => {
  const { skillId } = req.query;
  if (skillId === undefined) {
    res.status(400).send(gemInvalidField('Skill ID'));

    return;
  }
  findSkillBranchesBySkill(skillId as string)
    .then((skillBranches) => {
      const skillBranchIds = skillBranches.map((skillBranch) => String(skillBranch._id));
      findAndCurateNodesByParent({ skillBranchIds })
        .then((nodes) => {
          res.send(nodes);
        })
        .catch((err: unknown) => res.status(500).send(gemServerError(err)));
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

const findAllByCyberFrame = (req: Request, res: Response): void => {
  const { cyberFrameId }: { cyberFrameId?: string } = req.query;
  if (cyberFrameId === undefined) {
    res.status(400).send(gemInvalidField('Skill ID'));

    return;
  }
  findCyberFrameBranchesByFrame(cyberFrameId)
    .then((cyberFrameBranches) => {
      const cyberFrameBranchIds = cyberFrameBranches.map((cyberFrameBranch) =>
        String(cyberFrameBranch._id)
      );
      findAndCurateNodesByParent({ cyberFrameBranchIds })
        .then((nodes) => {
          res.send(nodes);
        })
        .catch((err: unknown) => res.status(500).send(gemServerError(err)));
    })
    .catch((err: unknown) => res.status(500).send(gemServerError(err)));
};

export {
  create,
  deleteNode,
  findAll,
  findAllByBranch,
  findAllByCyberFrame,
  findAllBySkill,
  findNodeById,
  findSingle,
  update,
};
